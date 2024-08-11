'use client'
import { signIn } from 'next-auth/react'
import React from 'react'

import { useSession } from "next-auth/react";
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import ChatBoxRAG from '../Chat/ChatBoxRAG';

const login = () => {
    const session = useSession();
    const fullnameformatted = session?.data?.user?.name?.split(" ").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(" ") || '';

    if (!session.data) {
        return (
            <Stack>
                <div className='text-slate-300 w-full p-2 text-2xl'>{fullnameformatted || "guest"}</div>
                <div className='gap-4 flex flex-col'>
                    <Button variant="contained" onClick={() => signIn('google')}>
                        {/* Add your button content here */}
                        Login
                    </Button>
                    <ChatBoxRAG />
                </div>
            </Stack>
        );
    } else {
        return (
            <Stack>
                <div className='text-slate-300 w-full p-2 text-2xl'>{fullnameformatted || "guest"}</div>
                <div className='gap-4 flex flex-col'>
                    <Button variant="contained" onClick={() => signIn('google')}>
                        {/* Add your button content here */}
                        Login
                    </Button>
                </div>
            </Stack>
        );
    }
};

export default login;
