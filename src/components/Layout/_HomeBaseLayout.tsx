import { Paper, Title } from '@mantine/core';
import React from 'react';

interface HomeBaseLayoutProps {
    children: React.ReactNode
    title: string
}

const HomeBaseLayout = ({
    children,
    title,
}: HomeBaseLayoutProps) => {

    return (
        <div
            className="flex justify-center items-center min-h-screen px-4"
            style={{
                background: 'linear-gradient(180deg, #faf7f2 0%, #f6f1ea 55%, #ffffff 100%)'
            }}
        >
            <Paper
                radius="lg"
                p="xl"
                withBorder
                className="w-full max-w-md"
                style={{
                    background: 'var(--marriplan-surface)',
                    borderColor: 'var(--marriplan-border)',
                    boxShadow: 'var(--marriplan-shadow)'
                }}
            >
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
