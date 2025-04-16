
/**
 * Calculate the perceived distance of an object based on its size in the frame.
 * 
 * @param width - The width of the bounding box (0-1 normalized)
 * @param height - The height of the bounding box (0-1 normalized)
 * @returns The distance category of the object ('near', 'medium', or 'far')
 */
export const calculateObjectDistance = (width: number, height: number): 'near' | 'medium' | 'far' => {
  // Calculate the area of the bounding box
  const area = width * height;
  
  // More precise threshold values to determine distance
  if (area > 0.18) {
    return 'near';
  } else if (area > 0.07) {
    return 'medium';
  } else {
    return 'far';
  }
};

/**
 * Estimate the approximate distance in meters based on the object's size in the frame.
 * This is an estimation based on the object's bounding box area.
 * 
 * @param width - The width of the bounding box (0-1 normalized)
 * @param height - The height of the bounding box (0-1 normalized)
 * @returns Estimated distance in meters
 */
export const estimateDistanceInMeters = (width: number, height: number): number => {
  const area = width * height;
  
  // These thresholds are estimates based on typical camera field of view
  // and typical object sizes (average human-sized object)
  if (area > 0.35) {
    return 0.5; // Very close (0.5m)
  } else if (area > 0.18) {
    return 1; // Near (1m)
  } else if (area > 0.1) {
    return 1.5; // Medium-near (1.5m)
  } else if (area > 0.07) {
    return 2; // Medium (2m)
  } else if (area > 0.04) {
    return 3; // Medium-far (3m)
  } else if (area > 0.02) {
    return 4; // Far (4m)
  } else {
    return 5; // Very far (5m+)
  }
};

/**
 * Determines if an object is within the proximity threshold (2 meters)
 * 
 * @param width - The width of the bounding box (0-1 normalized)
 * @param height - The height of the bounding box (0-1 normalized)
 * @returns Boolean indicating if the object is within 2 meters
 */
export const isObjectNearby = (width: number, height: number): boolean => {
  const estimatedDistance = estimateDistanceInMeters(width, height);
  return estimatedDistance <= 2;
};

/**
 * Filter out low confidence detections to improve precision.
 * 
 * @param objects - Array of detected objects
 * @param confidenceThreshold - Minimum confidence threshold (0-1)
 * @returns Array of objects that meet the confidence threshold
 */
export const filterByConfidence = (
  objects: Array<{ confidence: number, [key: string]: any }>,
  confidenceThreshold = 0.80  // Increased from 0.75 to 0.80 for better precision
) => {
  return objects.filter(obj => obj.confidence >= confidenceThreshold);
};

/**
 * Verifies if an object has all the required properties for sorting
 * 
 * @param obj - The object to verify
 * @returns Boolean indicating if the object has all required properties
 */
export const hasRequiredProperties = (obj: any): boolean => {
  return (
    obj &&
    typeof obj.distance === 'string' &&
    ['near', 'medium', 'far'].includes(obj.distance) &&
    obj.boundingBox &&
    typeof obj.boundingBox.width === 'number' &&
    typeof obj.boundingBox.height === 'number' &&
    typeof obj.boundingBox.x === 'number' &&
    typeof obj.boundingBox.y === 'number'
  );
};

/**
 * Sort detected objects by priority (distance and size).
 * 
 * @param objects - Array of detected objects
 * @returns Sorted array with highest priority objects first
 */
export const sortByPriority = (objects: Array<any>) => {
  // Filter objects to ensure they have the required structure
  const validObjects = objects.filter(hasRequiredProperties);
  
  return [...validObjects].sort((a, b) => {
    // First sort by distance (near objects have highest priority)
    const distancePriority = { near: 3, medium: 2, far: 1 };
    const distanceDiff = distancePriority[a.distance] - distancePriority[b.distance];
    
    if (distanceDiff !== 0) return distanceDiff;
    
    // If same distance, consider both size and confidence
    const aSize = a.boundingBox.width * a.boundingBox.height;
    const bSize = b.boundingBox.width * b.boundingBox.height;
    const sizeFactor = bSize - aSize;
    
    // Incorporate confidence into priority calculation
    const confidenceFactor = (b.confidence - a.confidence) * 0.5;
    
    // Return combined priority score, weighing size more than confidence
    return sizeFactor * 0.7 + confidenceFactor * 0.3;
  });
};

/**
 * Stabilize object detection by retaining consistent positions across frames
 * 
 * @param newObjects - Array of newly detected objects
 * @param previousObjects - Array of previously detected objects
 * @returns Array of stabilized objects
 */
export const stabilizeDetections = (
  newObjects: Array<any>,
  previousObjects: Array<any>
): Array<any> => {
  if (!previousObjects || previousObjects.length === 0) {
    return newObjects;
  }
  
  return newObjects.map(newObj => {
    // Find matching object from previous frame
    const previousMatch = previousObjects.find(prevObj => 
      prevObj.label === newObj.label && 
      calculateIoU(newObj.boundingBox, prevObj.boundingBox) > 0.5
    );
    
    if (previousMatch) {
      // Smooth the transition between frames
      return {
        ...newObj,
        confidence: (newObj.confidence * 0.7) + (previousMatch.confidence * 0.3),
        boundingBox: {
          x: (newObj.boundingBox.x * 0.7) + (previousMatch.boundingBox.x * 0.3),
          y: (newObj.boundingBox.y * 0.7) + (previousMatch.boundingBox.y * 0.3),
          width: (newObj.boundingBox.width * 0.7) + (previousMatch.boundingBox.width * 0.3),
          height: (newObj.boundingBox.height * 0.7) + (previousMatch.boundingBox.height * 0.3)
        }
      };
    }
    
    return newObj;
  });
};

/**
 * Calculate Intersection over Union (IoU) for two bounding boxes
 * 
 * @param box1 - First bounding box
 * @param box2 - Second bounding box
 * @returns IoU score (0-1)
 */
export const calculateIoU = (
  box1: {x: number, y: number, width: number, height: number},
  box2: {x: number, y: number, width: number, height: number}
): number => {
  // Calculate coordinates of intersection
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
  
  // No intersection
  if (x1 >= x2 || y1 >= y2) {
    return 0;
  }
  
  // Calculate areas
  const intersectionArea = (x2 - x1) * (y2 - y1);
  const box1Area = box1.width * box1.height;
  const box2Area = box2.width * box2.height;
  
  // Calculate IoU
  return intersectionArea / (box1Area + box2Area - intersectionArea);
};

/**
 * Filter out objects that would be outside the viewable frame
 * 
 * @param objects - Array of detected objects
 * @returns Array of objects within the viewable frame
 */
export const filterOutOfFrameObjects = (objects: Array<any>): Array<any> => {
  return objects.filter(obj => {
    const { x, y, width, height } = obj.boundingBox;
    
    // Check if the object is at least partially within frame (with some margin)
    const isWithinHorizontalBounds = x < 0.95 && x + width > 0.05;
    const isWithinVerticalBounds = y < 0.95 && y + height > 0.05;
    
    return isWithinHorizontalBounds && isWithinVerticalBounds;
  });
};

/**
 * Prevents duplicate detections of the same object in similar positions
 * 
 * @param objects - Array of detected objects
 * @returns Array with duplicates removed
 */
export const removeDuplicateDetections = (objects: Array<any>): Array<any> => {
  if (!objects || objects.length <= 1) return objects;
  
  const result: Array<any> = [];
  const processed = new Set<string>();
  
  objects.forEach(obj => {
    // Create a unique key based on object label and position (rounded to reduce precision)
    const key = `${obj.label}-${Math.round(obj.boundingBox.x * 10)}-${Math.round(obj.boundingBox.y * 10)}`;
    
    if (!processed.has(key)) {
      processed.add(key);
      result.push(obj);
    }
  });
  
  return result;
};
