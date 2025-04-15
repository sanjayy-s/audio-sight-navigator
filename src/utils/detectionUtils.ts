
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
  
  // Threshold values to determine distance
  // Objects taking up more space in the frame are closer
  if (area > 0.15) {
    return 'near';
  } else if (area > 0.05) {
    return 'medium';
  } else {
    return 'far';
  }
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
  confidenceThreshold = 0.75
) => {
  return objects.filter(obj => obj.confidence >= confidenceThreshold);
};

/**
 * Sort detected objects by priority (distance and size).
 * 
 * @param objects - Array of detected objects
 * @returns Sorted array with highest priority objects first
 */
export const sortByPriority = (objects: Array<{ 
  distance: 'near' | 'medium' | 'far',
  boundingBox: { width: number, height: number },
  [key: string]: any
}>) => {
  return [...objects].sort((a, b) => {
    // First sort by distance (near objects have highest priority)
    const distancePriority = { near: 3, medium: 2, far: 1 };
    const distanceDiff = distancePriority[a.distance] - distancePriority[b.distance];
    
    if (distanceDiff !== 0) return distanceDiff;
    
    // If same distance, sort by size (larger objects have higher priority)
    const aSize = a.boundingBox.width * a.boundingBox.height;
    const bSize = b.boundingBox.width * b.boundingBox.height;
    
    return bSize - aSize;
  });
};
