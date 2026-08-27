// Converts "10:00" -> 600 (minutes since midnight), for easy math
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Converts 600 -> "10:00"
const minutesToTime = (mins) => {
  const hours = Math.floor(mins / 60).toString().padStart(2, "0");
  const minutes = (mins % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Generates all possible slots between start and end, given slot duration
const generateSlots = (workingHours, slotDuration) => {
  const startMins = timeToMinutes(workingHours.start);
  const endMins = timeToMinutes(workingHours.end);

  const slots = [];
  for (let time = startMins; time + slotDuration <= endMins; time += slotDuration) {
    slots.push(minutesToTime(time));
  }
  return slots;
};

module.exports = { generateSlots, timeToMinutes, minutesToTime };