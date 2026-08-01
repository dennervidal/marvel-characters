import type { Character, Comic } from '@/types'

const thumbnailFor = (id: number) => ({
  path: `https://picsum.photos/seed/marvel-${id}/640/480`,
  extension: 'jpg'
})

const CURATED: Array<[string, string]> = [
  ['Iron Man', 'Genius inventor and billionaire in a high-tech suit of armor.'],
  ['Thor', 'God of Thunder, wielder of the enchanted hammer Mjolnir.'],
  ['Thanos', 'The Mad Titan on a quest to balance the universe.'],
  ['Spider-Man', 'Friendly neighborhood hero with spider-like abilities.'],
  ['Captain America', 'Super-soldier and the first Avenger.'],
  [
    'Hulk',
    'Scientist transformed by gamma radiation into the Incredible Hulk.'
  ],
  ['Black Widow', 'Master spy and elite Avenger with a mysterious past.'],
  [
    'Doctor Strange',
    'Sorcerer Supreme defending reality from mystical threats.'
  ],
  ['Wolverine', 'Mutant with regenerative healing and adamantium claws.'],
  ['Storm', 'X-Men leader who commands the weather itself.'],
  [
    'Black Panther',
    'King of Wakanda with enhanced senses and a vibranium suit.'
  ],
  ['Captain Marvel', "Cosmic-powered pilot turned Earth's mightiest hero."],
  ['Ant-Man', 'Size-shifting thief who became a hero.'],
  ['Wasp', 'Avenger who can shrink to insect size and fire energy blasts.'],
  ['Scarlet Witch', 'Reality-warping mutant wielding chaos magic.'],
  ['Vision', 'Synthezoid Avenger created from Ultron and vibranium.'],
  ['Hawkeye', 'Master archer who never misses his mark.'],
  ['Loki', 'God of Mischief, master of deception and illusion.'],
  ['Deadpool', "Merc with a mouth who just won't stay dead."],
  ['Daredevil', 'Blind lawyer fighting crime with radar senses.'],
  ['Ghost Rider', 'Spirit of Vengeance riding a flaming motorcycle.'],
  ['Punisher', 'Vigilante who wages a one-man war on crime.'],
  ['Venom', 'Symbiote-bonded anti-hero with alien powers.'],
  ['Carnage', 'Psychopathic offspring of the Venom symbiote.'],
  ['Doctor Doom', 'Ruler of Latveria and genius arch-villain.'],
  ['Magneto', 'Master of magnetism fighting for mutantkind.'],
  ['Professor X', "Founder of the X-Men, the world's most powerful telepath."],
  ['Cyclops', 'X-Men field leader firing devastating optic blasts.'],
  ['Jean Grey', 'Telepathic and telekinetic X-Man, host of the Phoenix.'],
  ['Rogue', 'Mutant who absorbs powers and memories by touch.'],
  ['Gambit', 'Cajun mutant who charges objects with kinetic energy.'],
  ['Nightcrawler', 'Teleporting blue mutant with three fingers.'],
  ['Beast', 'Blue-furred mutant genius with feline agility.'],
  ['Iceman', 'Omega-level mutant who controls ice and cold.'],
  ['Angel', 'Mutant with feathered wings, later known as Archangel.'],
  ['Falcon', 'Winged Avenger with a telepathic bond to Redwing.'],
  ['War Machine', 'Colonel Rhodes in a heavily armed suit of armor.'],
  ['Nick Fury', 'Director of S.H.I.E.L.D. who assembled the Avengers.'],
  ['Groot', 'A sentient tree from Planet X, last of his kind.'],
  ['Rocket Raccoon', 'Trash-panda gunsmith and master of mayhem.']
]

const PREFIXES = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'Iota',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
  'Xi',
  'Omicron',
  'Pi',
  'Rho',
  'Sigma',
  'Tau',
  'Upsilon'
]

const SUFFIXES = [
  'Beam',
  'Blade',
  'Bolt',
  'Buster',
  'Claw',
  'Comet',
  'Crusher',
  'Fang',
  'Flare',
  'Fury',
  'Guard',
  'Hunter',
  'Knight',
  'Lord',
  'Marauder',
  'Nova',
  'Oracle',
  'Paladin',
  'Phantom',
  'Ranger',
  'Reaper',
  'Scout',
  'Sentinel',
  'Slayer',
  'Specter',
  'Titan',
  'Vanguard',
  'Warden',
  'Wraith',
  'Zephyr'
]

const generated = (index: number): Character => {
  const prefix = PREFIXES[index % PREFIXES.length]
  const suffix = SUFFIXES[Math.floor(index / PREFIXES.length) % SUFFIXES.length]
  const id = 41 + index
  return {
    id,
    name: `${prefix} ${suffix}`,
    description: `A ${prefix.toLowerCase()} ${suffix.toLowerCase()} hero from an alternate universe.`,
    thumbnail: thumbnailFor(id)
  }
}

export const MOCK_CHARACTERS: Character[] = [
  ...CURATED.map(([name, description], index) => ({
    id: index + 1,
    name,
    description,
    thumbnail: thumbnailFor(index + 1)
  })),
  ...Array.from({ length: 260 }, (_, index) => generated(index))
]

export const getMockComics = (characterId: number): Comic[] => {
  const character = MOCK_CHARACTERS.find(c => c.id === characterId)
  if (!character) return []
  const count = 3 + (characterId % 4)
  return Array.from({ length: count }, (_, i) => ({
    id: characterId * 100 + i,
    title: `${character.name} #${i + 1}`,
    thumbnail: {
      path: `https://picsum.photos/seed/comic-${characterId}-${i}/480/640`,
      extension: 'jpg'
    }
  }))
}
