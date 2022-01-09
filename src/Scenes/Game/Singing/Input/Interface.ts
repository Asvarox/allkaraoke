export default interface InputInterface {
    startMonitoring: () => Promise<void>
    getFrequencies: () => [number, number]
    stopMonitoring: () => Promise<void>
}