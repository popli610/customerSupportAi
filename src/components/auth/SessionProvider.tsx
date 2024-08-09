'use client'
import { Session } from "next-auth"
import { SessionProvider as Provider } from "next-auth/react"

type Props = {
    children: React.ReactNode,
    session?: Session | null,
    provider?: string,
    options?: any,

}

const SessionProvider = ({children, session}: Props) => {
    return (
        <Provider>
            {children}
        </Provider>
    )
}

export default SessionProvider

