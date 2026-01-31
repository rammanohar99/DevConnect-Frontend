/**
 * Generate notification sound using Web Audio API
 * This creates a pleasant notification sound without needing an audio file
 */

let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a notification sound using Web Audio API
 */
export const playNotificationSound = (): void => {
  try {
    const context = getAudioContext()
    const currentTime = context.currentTime

    // Create oscillator for the main tone
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    // Set frequency (a pleasant notification tone)
    oscillator.frequency.setValueAtTime(800, currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.1)

    // Set volume envelope (fade in and out)
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2)

    // Play the sound
    oscillator.start(currentTime)
    oscillator.stop(currentTime + 0.2)

    // Add a second tone for richness
    const oscillator2 = context.createOscillator()
    const gainNode2 = context.createGain()

    oscillator2.connect(gainNode2)
    gainNode2.connect(context.destination)

    oscillator2.frequency.setValueAtTime(1000, currentTime + 0.05)
    oscillator2.frequency.exponentialRampToValueAtTime(800, currentTime + 0.15)

    gainNode2.gain.setValueAtTime(0, currentTime + 0.05)
    gainNode2.gain.linearRampToValueAtTime(0.2, currentTime + 0.06)
    gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25)

    oscillator2.start(currentTime + 0.05)
    oscillator2.stop(currentTime + 0.25)
  } catch (error) {
    console.warn('Failed to play notification sound:', error)
  }
}
