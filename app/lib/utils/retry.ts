export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            // Removed delay, will retry immediately
        }
    }
    
    throw lastError!;
}
