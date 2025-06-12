import React from 'react'
import {Paper, Title} from '@mantine/core';
import LanguageSelector from '@/components/LanguageSelector';

interface HomeBaseLayoutProps {
    children: React.ReactNode
    title: string
}

const HomeBaseLayout = ({
                            children,
                            title,
                        }: HomeBaseLayoutProps) => {

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
            <Paper radius="md" p="xl" withBorder className="w-full max-w-md">
                {/*<div className="flex justify-end mb-2">*/}
                {/*    <LanguageSelector />*/}
                {/*</div>*/}
                {title && <Title order={2} className="mb-6 text-center">{title}</Title>}
                {children}
            </Paper>
        </div>
    )
}

export default HomeBaseLayout
