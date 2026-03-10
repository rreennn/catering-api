const cutoffMap = {
  breakfast: 5,
  lunch: 10,
  dinner: 15,
};

exports.isMealStillOrderable = (tanggalDelivery, mealType) => {
  const now = new Date();

  const deliveryDate = new Date(tanggalDelivery);
  deliveryDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Kalau bukan hari ini → selalu boleh
  if (deliveryDate.getTime() !== today.getTime()) {
    return true;
  }

  const cutoffHour = cutoffMap[mealType];

  if (cutoffHour === undefined) {
    throw new Error("Meal type tidak valid");
  }

  return now.getHours() < cutoffHour;
};
