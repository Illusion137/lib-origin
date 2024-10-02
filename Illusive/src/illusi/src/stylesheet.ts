import { StyleSheet } from "react-native";

const theme_colors = {
    primary: '#7400fe',
    secondary: '#fc00c9',
    background: '#0d1016',
    header: '#161B22',
    text: "#ffffff",
    subtext: "#8c939d",
    
    text_input: '#404254',
    text_input_placeholder: '#8080a0',
    

    // card: '#131213',
    // border: '#222222',
    // notification: '#1313ff',
    // tabInactive: '#cad1d8',
    // line: '#303040',
    // inactive: '#8080a0',
    // red: '#FF0000',
    // green: '#00FF00',
    // playingSong: '#141722',
    // playScreen: '#141722',
    // track: '#141722',
    // highlightPressColor: '#bbaaff'
};

const styles = StyleSheet.create({
    top_container: {
        backgroundColor: theme_colors.background,
        justifyContent: 'flex-start',
        flex: 1,
    },
    library_header: {
		backgroundColor: theme_colors.header,
		width: '100%',
		height: '18%',
		top: 0,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	toptext: {
		bottom: 20,
		color: theme_colors.text,
		fontSize: 18,
		fontWeight: '500'
	},
	searchinput:{
		backgroundColor: theme_colors.text_input,
		color: theme_colors.text,
		width: '75%',
		bottom: 10,
		paddingLeft: 10,
		fontSize: 15,
		borderTopRightRadius: 10,    // Top Right Corner
		borderBottomRightRadius: 10, // Bottom Right Corner
	},
	searchcontainer:{
		justifyContent: 'center',
		height: '24%',
		left:-5,
		width: '100%',
		flexDirection: 'row'
	},
	icon:{
		overflow: 'hidden',
		backgroundColor: theme_colors.text_input_placeholder,
		paddingTop: 5,
		paddingLeft: 5,
		paddingRight: 5,
		bottom: 10,
		left: 10,
		borderRadius:10,
		zIndex: 1
	},
	sectionHeader: {
		width: '100%',
		height: 30,
		backgroundColor: theme_colors.background,
		justifyContent: 'center'
	},
	sectionText:{
		color: theme_colors.text,
		fontSize: 18,
		fontWeight: 'bold',
		marginHorizontal: 10
	},
});