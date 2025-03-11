// src/app/api/shopping-list/data-service.ts
import { createClient } from 'redis';

export type ShoppingItem = {
    id: string;
    name: string;
    quantity: number;
    description?: string;
    completed: boolean;
    createdAt: string;
};

export type ShoppingListData = {
    items: ShoppingItem[];
};

// Jednoduché lokální úložiště pro vývoj
let localStorageData: ShoppingListData = { items: [] };

// Redis klient
let redis: ReturnType<typeof createClient>;

// Inicializace Redis klienta
async function getRedisClient() {
    if (!redis) {
        redis = createClient({
            url: process.env.REDIS_URL
        });

        redis.on('error', (err) => console.log('Redis Client Error', err));
        await redis.connect();
    }

    return redis;
}

// Funkce pro práci s daty, která automaticky rozhodne, zda použít Redis nebo lokální paměť
export async function getData(): Promise<ShoppingListData> {
    // V produkci nebo pokud je Redis k dispozici
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
        try {
            const client = await getRedisClient();
            const data = await client.get('shopping-list');
            return data ? JSON.parse(data) : { items: [] };
        } catch (error) {
            console.error('Redis error:', error);
        }
    }

    // Fallback na lokální úložiště pro vývoj
    return localStorageData;
}

export async function saveData(data: ShoppingListData): Promise<void> {
    // Aktualizace lokální kopie v každém případě
    localStorageData = data;

    // V produkci nebo pokud je Redis k dispozici
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
        try {
            const client = await getRedisClient();
            await client.set('shopping-list', JSON.stringify(data));
        } catch (error) {
            console.error('Redis error:', error);
        }
    }
}