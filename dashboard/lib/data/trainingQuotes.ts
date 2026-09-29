/**
 * Motivational Training Quotes
 * Data-driven — rotate in UI without modifying components.
 */

export interface TrainingQuote {
  id: string;
  text: string;
  author?: string;
  category?: "discipline" | "consistency" | "recovery" | "mindset" | "martial-arts" | "strength";
}

export const TRAINING_QUOTES: TrainingQuote[] = [
  {
    id: "q01",
    text: "Don't count the days. Make the days count.",
    author: "Muhammad Ali",
    category: "discipline",
  },
  {
    id: "q02",
    text: "The fight is won or lost far away from witnesses — behind the lines, in the gym, and out there on the road.",
    author: "Muhammad Ali",
    category: "discipline",
  },
  {
    id: "q03",
    text: "It's not the size of the dog in the fight, it's the size of the fight in the dog.",
    author: "Mark Twain",
    category: "mindset",
  },
  {
    id: "q04",
    text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.",
    author: "Bruce Lee",
    category: "martial-arts",
  },
  {
    id: "q05",
    text: "Absorb what is useful, discard what is not, add what is uniquely your own.",
    author: "Bruce Lee",
    category: "martial-arts",
  },
  {
    id: "q06",
    text: "Pain is temporary. It may last a minute, or an hour, or a day, or a year, but eventually it will subside. If I quit, however, it lasts forever.",
    author: "Lance Armstrong",
    category: "discipline",
  },
  {
    id: "q07",
    text: "We do not rise to the level of our expectations. We fall to the level of our training.",
    author: "Archilochus",
    category: "discipline",
  },
  {
    id: "q08",
    text: "It is not daily increase but daily decrease. Hack away at the inessentials.",
    author: "Bruce Lee",
    category: "martial-arts",
  },
  {
    id: "q09",
    text: "Excellence is not a singular act, but a habit. You are what you repeatedly do.",
    author: "Aristotle",
    category: "consistency",
  },
  {
    id: "q10",
    text: "Strength does not come from winning. Your struggles develop your strengths.",
    author: "Arnold Schwarzenegger",
    category: "strength",
  },
  {
    id: "q11",
    text: "The body achieves what the mind believes.",
    category: "mindset",
  },
  {
    id: "q12",
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King",
    category: "consistency",
  },
  {
    id: "q13",
    text: "A black belt is a white belt who never quit.",
    category: "martial-arts",
  },
  {
    id: "q14",
    text: "Rest when you are weary. Refresh and renew yourself, your body, your mind, your spirit.",
    author: "Ralph Marston",
    category: "recovery",
  },
  {
    id: "q15",
    text: "Recovery is just as important as the workout itself.",
    category: "recovery",
  },
  {
    id: "q16",
    text: "Train hard, recover harder.",
    category: "recovery",
  },
  {
    id: "q17",
    text: "The successful warrior is the average man with laser-like focus.",
    author: "Bruce Lee",
    category: "mindset",
  },
  {
    id: "q18",
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Robin Sharma",
    category: "consistency",
  },
  {
    id: "q19",
    text: "Your only limit is your mind.",
    category: "mindset",
  },
  {
    id: "q20",
    text: "Push yourself because no one else is going to do it for you.",
    category: "discipline",
  },
  {
    id: "q21",
    text: "Taekwondo is not just a sport. It is a way of life.",
    category: "martial-arts",
  },
  {
    id: "q22",
    text: "The more you sweat in training, the less you bleed in battle.",
    author: "Richard Marcinko",
    category: "discipline",
  },
  {
    id: "q23",
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    category: "discipline",
  },
  {
    id: "q24",
    text: "Knowing is not enough, we must apply. Willing is not enough, we must do.",
    author: "Bruce Lee",
    category: "martial-arts",
  },
  {
    id: "q25",
    text: "An exhausted body is not a failed body. It is a body that gave everything it had today.",
    category: "recovery",
  },
  {
    id: "q26",
    text: "Progress over perfection. Show up. Do the work. Rest. Repeat.",
    category: "consistency",
  },
  {
    id: "q27",
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "mindset",
  },
  {
    id: "q28",
    text: "The hardest step is always the first one. After that, you're already moving.",
    category: "mindset",
  },
  {
    id: "q29",
    text: "Train like there's no tomorrow. Recover like it depends on it.",
    category: "recovery",
  },
  {
    id: "q30",
    text: "In training, every rep you do when you're tired is the one that counts the most.",
    category: "discipline",
  },
];

