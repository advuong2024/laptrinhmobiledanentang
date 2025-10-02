import 'react-native-get-random-values';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export const getGuestId = async () => {
  let guestId = await AsyncStorage.getItem("guest_id");
  if (!guestId) {
    guestId = uuidv4();
    await AsyncStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

// Khi logout tạo lại guest cart mới
export const resetGuestId = async () => {
  const newGuestId = uuidv4();
  await AsyncStorage.setItem("guest_id", newGuestId);
  return newGuestId;
};
