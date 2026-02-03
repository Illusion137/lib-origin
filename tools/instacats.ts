import * as fs from 'fs';
import request from 'request';
import { Instagram } from "@origin/instagram/instragram";
import type { MediaListItem } from "@origin/instagram/types/MediaList";
import { CookieJar } from "@common/utils/cookie_util";
import { catch_log } from '@common/utils/error_util';

const threshold = 72;
const cookie_jar = CookieJar.fromString(process.env.INSTAGRAM_COOKIE_JAR);
const cat_posters_usernames: string[] = ["maoxiaosi_219", "brownsugar_ddang", "sasuke.0116"];
const cat_regex = /(cat)|(kitty)/ig;

//GUESS 2025
//[SETH]CATS - 14750 +- 100 : 10000 DANIEL
//[SETH]BUNNY - 3290 +- 100 : 3000 DANIEL

async function main() {
	// const all_collections = await Instagram.all_collections({cookie_jar});
	// console.log(all_collections);

	const cats_collection_id = "17877414743861513";
	let cats_collection = await Instagram.collection_posts({ cookie_jar, collection_id: cats_collection_id });
	if ("error" in cats_collection || cats_collection.status === "fail") return;

	function parse_collection(items: MediaListItem[]) {
		return items
			.map(item => ({ username: item.media.user.username, name: item.media.user.full_name }))
			.filter(item => cat_posters_usernames.includes(item.username) || cat_regex.test(item.username) || cat_regex.test(item.name));
	}
	
	let only_cat_posters = parse_collection(cats_collection.items);
	const seen_cat_posters_usernames = new Set<string>();
	const seen_ids = new Set<string>();

	let i = 0;
	let length = only_cat_posters.length;
	async function add_only_cat_posters(only_cat_posters_data: { username: string; name: string }[]) {
		const cat_posts_to_add: string[] = [];
		for (const cat_poster of only_cat_posters_data) {
			if (seen_cat_posters_usernames.has(cat_poster.username)) {
				console.log("Seen: ", cat_poster.username);
				continue;
			}
			seen_cat_posters_usernames.add(cat_poster.username);
			const user_posts = await Instagram.user_posts({ cookie_jar, username: cat_poster.username, count: 30 });
			if ("error" in user_posts) {
				console.warn(user_posts);
				continue;
			}
			const edges = user_posts.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges;
			for (const edge of edges) {
				if (seen_ids.has(edge.node.pk)) {
					continue;
				}
				seen_ids.add(edge.node.pk);
				cat_posts_to_add.push(edge.node.pk);
				console.log("Edge Added: ", edge.node.like_count, " : ", edge.node.pk);
			}
			i++;
			if (i >= threshold) return 0;
		}

		return undefined;
	}
	await add_only_cat_posters(only_cat_posters);

	while (cats_collection.more_available) {
		console.log("ID: ", cats_collection.next_max_id);
		cats_collection = await Instagram.collection_posts_more({ cookie_jar, collection_id: cats_collection_id, max_id: cats_collection.next_max_id });
		if ("error" in cats_collection) {
			console.log("WHILE: ", cats_collection);
			break;
		}
		console.log("CONTINUING");
		only_cat_posters = parse_collection(cats_collection.items);
		length += only_cat_posters.length;
		console.log("AMOUNT: ", only_cat_posters.length);
		const result = await add_only_cat_posters(only_cat_posters);
		if (result === 0) break;
	}

	// console.log("To add Cat Posts: ", cat_posts_to_add);
	console.log("Seen usernames: ", [...seen_cat_posters_usernames.values()]);
	console.log("LENGTH: ", length);
	fs.writeFileSync("./catids.txt", JSON.stringify([...seen_ids.values()]));
}
main;
// main();

async function editstuff() {
	const cats_collection_id = "17877414743861513";
	const ids: any[] = JSON.parse(fs.readFileSync("./catids.txt").toString());

	// await new Promise(resolve => setTimeout(resolve, 1000)); // 3 sec

	for (let i = 8; (i + 1) < (ids.length / 30); i++) {
		const sliced = ids.slice(i * 30, (i + 1) * 30);
		await Instagram.edit_collection({ cookie_jar, collections_id: cats_collection_id, add_media_ids: sliced });
		console.log("SAVED: ", sliced.length);
		await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec
	}
	// for(const id of ids.slice(113)){
	// await Instagram.save_post({cookie_jar, media_id: id});
	// await Instagram.edit_collection({cookie_jar, collections_id: cats_collection_id, add_media_ids: [ids]});
	// console.log("SAVED: ", id);
	// }

} editstuff;
// editstuff();
let dl_index = 0;
async function dlpost(uri: string){
    request.head(uri, function(err, res, body){
        err; res; body;
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        const path = `ignore/cats/cat_${dl_index++}.jpg`;
        request(uri).pipe(fs.createWriteStream(path)).on('close', () => {
            console.log(path);
        });
    });
}
function dispatch_dlposts(items: MediaListItem[]){
    for(const post of items){
        if(post.media.carousel_media === undefined) continue;
        for(const media of post.media.carousel_media){
            if(media.image_versions2.candidates.length > 0){
                dlpost(media.image_versions2.candidates[0].url).catch(catch_log);
            }
        }
    }
}
async function catdl(){
	const cats_collection_id = "17877414743861513";
    let cats_collection = await Instagram.collection_posts({ cookie_jar, collection_id: cats_collection_id });
    if("error" in cats_collection) {
        console.error(cats_collection.error.stack);
        return;
    }
    dispatch_dlposts(cats_collection.items);

    let max_refreshes = 30000;
    while (max_refreshes-- > 0 && cats_collection.more_available) {
		cats_collection = await Instagram.collection_posts_more({ cookie_jar, collection_id: cats_collection_id, max_id: cats_collection.next_max_id });
		if ("error" in cats_collection) {
			console.error(cats_collection.error);
			break;
		}
        dispatch_dlposts(cats_collection.items);
	}
}

//24K +- 1 -> 48k
catdl().catch(catch_log);
// ISAIAH
// 4798

// SETH
// 12961

// DANIEL
// 8534

// TOTAL
// 7087

async function how_many_cats() {
	let count = 0;
	const cats_collection_id = "17877414743861513";
	let max_id: string | undefined = undefined;
	do {
		const posts = await Instagram.collection_posts({ cookie_jar, collection_id: cats_collection_id, max_id });
		if ("error" in posts) break;
		count += posts.items.length;
		if (!posts.more_available) break;
		max_id = posts.next_max_id;
	} while (max_id !== undefined);
	console.log("TOTAL CATS IN CATS: ", count);
} how_many_cats;
// how_many_cats();