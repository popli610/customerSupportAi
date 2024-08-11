'use client'
import { signIn } from 'next-auth/react'
import React from 'react'

import { useSession } from "next-auth/react";
import { Box, Button, Stack, TextField, Typography } from '@mui/material';


const Login = () => {
    const session = useSession()
    const fullNameFormatted = session?.data?.user?.name?.split(" ").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(" ") || ''


    return (
        <Stack >
            <div  className='text-slate-300 w-full p-2 text-2xl'>
                {fullNameFormatted || "Guest"}
            </div>
            <Button variant="contained"      onClick={() => signIn('google')}>
            {/* //  className="relative inline-flex w-[20rem] h-24  overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"> */}
                LOGIN
                
            </Button>
        </Stack>
    )
}

export default Login
