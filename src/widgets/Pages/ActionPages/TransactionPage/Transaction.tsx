import styled from "styled-components"
import TransactionInput from "./SubWidgets/TransactionInput"
import NamePage from "../NamePage"

type Props = {}

export default function Transaction({ }: Props) {
    return (
        <TransactionWrapper>
            <NamePage/>
            <TransactionInput />
            <EmptyArea />
        </TransactionWrapper>
    )
}

const TransactionWrapper = styled.div`
    width: calc(100vw - 70px);
    height: calc(100vh - 70px);
    position: absolute;
    top: 60px;
    left: 60px;
    box-sizing: border-box;
    display: grid;
    grid-template-areas:
        "namePage "
        "transaction";
    grid-template-columns: 600px 1fr;
    grid-template-rows: 50px auto ;
    gap: 8px;
    padding: 5px;
`

const EmptyArea = styled.div`
    grid-area: empty;
`

