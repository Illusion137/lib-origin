export type Action = FormBusinessAction|FinanceSavingsAction|FinanceLoanAction|LocateBusinessAction|ChangeInsuranceAction|UpdatePricesAction|AddItemAction|MoveItemAction|RotateItemAction|BookAdAction;

interface FormBusinessAction {
    type: "form_business";
    business_type: "Smoothie Shop"|"Pizza Place"|"Plumbing Business"|"Electrical Business"|"Physical Therapy"|"Hair Salon"|"Auto Repair Shop"|"Catering"|"Online Gift Baskets"|"Trampoline Park"|"Bowling Alley"|"Fitness Center"|"Coffee Shop"|"Ice Cream Shop"|"T Shirt Printing"|"Burrito Shop"|"Lawncare"|"Disc Jockey"|"Batting Cage"|"Go Karts";
    name: string;
}
interface FinanceSavingsAction {
    type: "finance_savings";
    amount: number;
}
interface FinanceLoanAction {
    type: "finance_loan";
    amount: number;
}
interface LocateBusinessAction {
    type: "locate_business";
    locid: number;
}
interface ChangeInsuranceAction {
    type: "change_insurance";
    deductible: 250|500|1000|2000;
    coverage: number;
}
interface UpdatePricesAction {
    type: "update_prices";
    prices: {
        name: string;
        price: number;
    }[]
}
interface AddItemAction {
    type: "add_item";
    name: string;
    loc: [number, number];
}
interface MoveItemAction {
    type: "move_item";
    loc: [number, number];
    to_loc: [number, number];
}
interface RotateItemAction {
    type: "rotate_item";
    loc: [number, number];
    face: "SE"|"SW";
}
interface BookAdAction {
    type: "book_ad";
    from_date?: Date;
    to_date?: Date;
    daily_budget: number;
    headline: string;
    text: string;
    image_id: number;
    distance: ("<4 blocks"|"4 to 10 blocks"|"11 to 20 blocks"|">20 blocks")[];
    income: ("<$25K"|"$25K to $60K"|"$61K to $100K"|"$100K+")[];
    age: ("18 to 28"|"29 to 49"|"50+")[];
    gender: ("Male"|"Female")[];
    interests: "Bath & Spas"|"Batting (baseball)"|"Beauty"|"Ben & Jerry's"|"Bowling"|"Business Purchases"|"Chicago-style Pizza"|"Chipotle"|"Construction"|"Dance"|"Design & Decorating"|"Electronic Dance Music"|"Family Activities"|"Fashion"|"Frozen Dessert"|"Gardening"|"Gift Baskets"|"Gymnastics"|"Hairstyles"|"Health & Wellness"|"High School Football"|"Home Ownership"|"Home Renovation"|"Ice cream"|"Juice"|"Kart Racing"|"Lattes"|"Little League Baseball"|"Local Food"|"Mexican Cuisine"|"Motorsports"|"Muscle & Fitness"|"Muscle Cars"|"NASCAR"|"Nightclubs"|"Organic horticulture"|"Parenting"|"Personal Trainer"|"Physical Fitness"|"Pizza"|"Pizza Hut"|"Plants"|"Pop Warner Football"|"Property Maintenance"|"Rehabilitation"|"Remodeling"|"Shopping"|"Small Business Ownership"|"Smoothie King"|"Smoothies"|"Social Clubs"|"Starbucks"|"Street Food, Mexican"|"Trampolining"|"Unique Gifts"|"Vehicles"|"Vintage Cars"|"Wedding & Event Planning"|"Zomba";
}