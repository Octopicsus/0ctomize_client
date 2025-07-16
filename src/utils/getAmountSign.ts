const getAmountSign = (category: string) => {
    return category === 'Income' ? '+' : '-'
}

export default getAmountSign