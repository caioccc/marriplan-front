import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function truncate(str: string, max: number) {
    return str.length > max ? str.slice(0, max) + '…' : str;
}

export const PAGE_SIZE = 10;
export const PAGES_SIZES = [5, 10, 20, 50, 100];