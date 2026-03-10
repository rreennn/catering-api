const dayMap = {
  minggu: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
};

exports.getDeliveryDate = (menuDay) => {
  const now = new Date();
  const today = now.getDay();
  const targetDay = dayMap[menuDay.toLowerCase()];

  if (targetDay === undefined) {
    throw new Error("Hari tidak valid");
  }

  let diff = targetDay - today;

  // ⭐ Sabtu setelah dinner cutoff → minggu depan
  if (today === 6 && now.getHours() >= 15) {
    diff = 7 + targetDay - today;
  }

  // ⭐ Hari sudah lewat → tidak boleh pesan minggu ini
  else if (diff < 0) {
    throw new Error("Hari menu sudah lewat");
  }

  const deliveryDate = new Date(now);
  deliveryDate.setDate(now.getDate() + diff);
  deliveryDate.setHours(0, 0, 0, 0);

  return deliveryDate;
};
