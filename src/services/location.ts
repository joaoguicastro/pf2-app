import * as Location from 'expo-location';

export type Coordinates = { latitude: number; longitude: number };

export async function getCurrentCoordinates(timeoutMs = 8000): Promise<Coordinates | undefined> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return undefined;
    if (!(await Location.hasServicesEnabledAsync())) return undefined;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), timeoutMs); }),
    ]).finally(() => clearTimeout(timer));

    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return undefined;
  }
}