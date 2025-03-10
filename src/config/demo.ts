export const DEMO_CONFIG = {
  mqtt: {
    broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    topics: {
      led: 'demo/led/control',
      sensor: 'demo/sensor/reading',
    }
  },
  mongodb: {
    collection: 'color_mixing_experiments'
  },
  optimization: {
    maxSteps: 20,
    convergenceThreshold: 0.01,
    defaultExplorationWeight: 0.1
  }
}; 