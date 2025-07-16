import { LINK_ROUTES } from "../enums/routes"
import { CATEGORY } from "../enums/categoryTitles"

export default function getCategoryPath(category: string) {
    switch (category) {
        case CATEGORY.EXPENSE:
            return LINK_ROUTES.EXPENSE
        case CATEGORY.INCOME:
            return LINK_ROUTES.INCOME
        case CATEGORY.ALL:
            return LINK_ROUTES.ALL
        default:
            return "/"
    }
}