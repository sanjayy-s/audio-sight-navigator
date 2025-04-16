
import { DetectedObject } from '../types/detection';
import { calculateObjectDistance } from '../utils/detectionUtils';

export const objectDefinitions = [
  { 
    label: 'person', 
    sizeRange: { min: 0.1, max: 0.4 },
    confidenceRange: { min: 0.85, max: 0.98 },
    spawnChance: 0.6
  },
  { 
    label: 'chair', 
    sizeRange: { min: 0.05, max: 0.2 },
    confidenceRange: { min: 0.82, max: 0.95 },
    spawnChance: 0.4
  },
  { 
    label: 'table', 
    sizeRange: { min: 0.1, max: 0.3 },
    confidenceRange: { min: 0.8, max: 0.95 },
    spawnChance: 0.3
  },
  { 
    label: 'cup', 
    sizeRange: { min: 0.02, max: 0.08 },
    confidenceRange: { min: 0.75, max: 0.92 },
    spawnChance: 0.2
  },
  { 
    label: 'book', 
    sizeRange: { min: 0.02, max: 0.1 },
    confidenceRange: { min: 0.78, max: 0.94 },
    spawnChance: 0.2
  },
  { 
    label: 'phone', 
    sizeRange: { min: 0.01, max: 0.06 },
    confidenceRange: { min: 0.8, max: 0.96 },
    spawnChance: 0.2
  },
  { 
    label: 'laptop', 
    sizeRange: { min: 0.08, max: 0.25 },
    confidenceRange: { min: 0.85, max: 0.97 },
    spawnChance: 0.3
  },
  { 
    label: 'door', 
    sizeRange: { min: 0.15, max: 0.4 },
    confidenceRange: { min: 0.82, max: 0.96 },
    spawnChance: 0.3
  },
  { 
    label: 'window', 
    sizeRange: { min: 0.1, max: 0.35 },
    confidenceRange: { min: 0.8, max: 0.95 },
    spawnChance: 0.3
  }
];

export const simulateObjectMovement = (
  persistedObjects: DetectedObject[]
): DetectedObject[] => {
  return [...persistedObjects].map(obj => {
    const xMove = (Math.random() - 0.5) * 0.02;
    const yMove = (Math.random() - 0.5) * 0.02;
    
    return {
      ...obj,
      id: `${obj.label}-${Date.now()}-${Math.random()}`,
      boundingBox: {
        ...obj.boundingBox,
        x: Math.min(Math.max(0, obj.boundingBox.x + xMove), 1 - obj.boundingBox.width),
        y: Math.min(Math.max(0, obj.boundingBox.y + yMove), 1 - obj.boundingBox.height)
      }
    };
  });
};

export const generateNewObjects = (count: number): DetectedObject[] => {
  const newObjects: DetectedObject[] = [];
  
  for (let i = 0; i < count; i++) {
    const possibleDefinitions = objectDefinitions.filter(def => 
      Math.random() < def.spawnChance
    );
    
    if (possibleDefinitions.length === 0) continue;
    
    const definition = possibleDefinitions[Math.floor(Math.random() * possibleDefinitions.length)];
    
    const widthRange = definition.sizeRange.max - definition.sizeRange.min;
    const heightRange = widthRange * (0.8 + Math.random() * 0.4);
    
    const width = definition.sizeRange.min + (Math.random() * widthRange);
    const height = definition.sizeRange.min + (Math.random() * heightRange);
    
    const x = Math.random() * (0.9 - width);
    const y = Math.random() * (0.9 - height);
    
    const distance = calculateObjectDistance(width, height);
    
    const confidenceRange = definition.confidenceRange.max - definition.confidenceRange.min;
    const confidence = definition.confidenceRange.min + (Math.random() * confidenceRange);
    
    newObjects.push({
      id: `${definition.label}-${Date.now()}-${i}`,
      label: definition.label,
      confidence,
      boundingBox: { x, y, width, height },
      distance,
    });
  }
  
  return newObjects;
};

export const simulateDetection = (
  persistedObjects: DetectedObject[], 
  generationCount: number
): DetectedObject[] => {
  let mockObjects = simulateObjectMovement(persistedObjects);
  
  if (generationCount % 3 === 0) {
    const newObjectCount = Math.floor(Math.random() * 3);
    const newObjects = generateNewObjects(newObjectCount);
    mockObjects = [...mockObjects, ...newObjects];
  }
  
  // Randomly filter out some objects to simulate detection variability
  return mockObjects.filter(() => Math.random() > 0.1);
};
