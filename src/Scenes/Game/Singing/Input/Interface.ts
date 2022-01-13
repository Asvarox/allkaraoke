export default interface InputInterface {
    startMonitoring: () => Promise<void>
    getFrequencies: () => [number, number]
    getInputLag: () => number
    stopMonitoring: () => Promise<void>
}