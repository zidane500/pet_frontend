export type PostType = 'adoption' | 'vente' | 'perdu' | 'trouve' | 'urgence' | 'accouplement' | 'conseils' | 'association' | 'vet';
export type UserType = 'particulier' | 'eleveur' | 'refuge' | 'association' | 'vet';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
  replies?: Comment[];
  liked?: boolean;
}

export interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    type: UserType;
    verified: boolean;
    location: string;
    followers?: number;
  };
  type: PostType;
  animal?: {
    species: string;
    breed: string;
    sex: 'male' | 'female';
    age: string;
    size?: string;
    vaccinated: boolean;
    sterilized: boolean;
  };
  media: { type: 'image' | 'video'; url: string }[];
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  timestamp: string;
  liked: boolean;
  saved: boolean;
  commentsList: Comment[];
}

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user: { name: 'Sarah Ben Ali', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=80&h=80&fit=crop&crop=face', type: 'particulier', verified: false, location: 'Tunis, Les Berges du Lac', followers: 243 },
    type: 'adoption',
    animal: { species: 'Chien', breed: 'Labrador mix', sex: 'female', age: '2 ans', size: 'Grand', vaccinated: true, sterilized: false },
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop' },
    ],
    caption: 'Nala cherche sa famille pour toujours 💚 Elle est douce, affectueuse et adore les enfants. En attente depuis 8 mois au refuge. Elle mérite une vraie maison pleine d\'amour. DM pour plus d\'infos !',
    likes: 347, comments: 42, shares: 28, views: 2840,
    timestamp: '2h',
    liked: false, saved: false,
    commentsList: [
      { id: 'c1', author: 'Ahmed Sfax', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', text: 'Quelle belle chienne ! Je vais en parler à ma famille 🥹', likes: 12, time: '1h', liked: false, replies: [
        { id: 'c1r1', author: 'Sarah Ben Ali', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=40&h=40&fit=crop&crop=face', text: 'Merci Ahmed ! N\'hésitez pas à me contacter en DM 💚', likes: 5, time: '45min', liked: false },
      ]},
      { id: 'c2', author: 'Ines Monastir', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face', text: 'Elle est tellement mignonne 😍 J\'espère qu\'elle trouvera vite une famille', likes: 8, time: '30min', liked: false },
    ],
  },
  {
    id: 'p2',
    user: { name: 'Élevage El Amira', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', type: 'eleveur', verified: true, location: 'Sousse, Khzama', followers: 1820 },
    type: 'vente',
    animal: { species: 'Chat', breed: 'Persan', sex: 'male', age: '3 mois', size: 'Petit', vaccinated: true, sterilized: false },
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop' },
    ],
    caption: '🐱 Magnifiques chatons persans disponibles ! Lignée pure, vaccinations à jour, passeport de santé fourni. Prix : 450 DT. Contact via DM uniquement. Livraison possible sur Tunis et Sfax.',
    likes: 892, comments: 156, shares: 74, views: 8430,
    timestamp: '5h',
    liked: true, saved: true,
    commentsList: [
      { id: 'c3', author: 'Rim Bizerte', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', text: 'Le prix inclut les vaccinations ?', likes: 3, time: '4h', liked: false },
      { id: 'c4', author: 'Khaled Nabeul', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', text: 'Trop beaux ! Je suis intéressé 🥺', likes: 7, time: '3h', liked: true },
    ],
  },
  {
    id: 'p3',
    user: { name: 'Marwa Trabelsi', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', type: 'particulier', verified: false, location: 'Ariana, Ettadhamen', followers: 89 },
    type: 'perdu',
    animal: { species: 'Chien', breed: 'Spitz nain', sex: 'male', age: '4 ans', size: 'Petit', vaccinated: true, sterilized: true },
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=600&h=600&fit=crop' },
    ],
    caption: '🚨 URGENT — Mon chien Tobi a disparu hier soir vers 21h dans le quartier Ettadhamen, Ariana. Il est blanc, petit, très doux. Si vous le voyez SVP contactez-moi immédiatement au +216 55 123 456. Récompense offerte 🙏',
    likes: 1240, comments: 203, shares: 482, views: 12800,
    timestamp: '8h',
    liked: false, saved: false,
    commentsList: [
      { id: 'c5', author: 'Mohamed Sousse', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', text: 'Je partage dans tous les groupes ! Courage Marwa 🙏', likes: 45, time: '7h', liked: false },
      { id: 'c6', author: 'Fatma Gafsa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face', text: 'Partagé ! J\'espère que vous le retrouvez vite 💔', likes: 23, time: '6h', liked: true },
    ],
  },
  {
    id: 'p4',
    user: { name: 'Refuge Espoir Tunis', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face', type: 'refuge', verified: true, location: 'Tunis, La Marsa', followers: 4320 },
    type: 'association',
    animal: undefined,
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600&h=600&fit=crop' },
    ],
    caption: '🏠 Journée portes ouvertes ce samedi au Refuge Espoir ! Venez rencontrer nos pensionnaires, adoptez ou devenez famille d\'accueil. Plus de 60 chiens et chats attendent votre visite. Entrée libre, amenez vos enfants ! 🐾❤️',
    likes: 2103, comments: 187, shares: 341, views: 18900,
    timestamp: '12h',
    liked: true, saved: false,
    commentsList: [
      { id: 'c7', author: 'Leila Sfax', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=40&h=40&fit=crop&crop=face', text: 'On arrive samedi avec toute la famille ! ❤️', likes: 32, time: '10h', liked: false },
    ],
  },
  {
    id: 'p5',
    user: { name: 'Dr. Mehdi Gharbi', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face', type: 'vet', verified: true, location: 'Sfax, Centre-ville', followers: 6780 },
    type: 'conseils',
    animal: undefined,
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop' },
    ],
    caption: '🩺 Conseil du jour : La chaleur estivale est dangereuse pour vos animaux ! Ne laissez jamais votre animal dans une voiture, même fenêtre entrouverte. Hydratez-le souvent et évitez les promenades entre 11h et 16h. Partagez pour sensibiliser ! 🌡️',
    likes: 1876, comments: 94, shares: 623, views: 22400,
    timestamp: '1j',
    liked: false, saved: true,
    commentsList: [
      { id: 'c8', author: 'Sara Monastir', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', text: 'Merci Docteur, très utile ! Partagé 🙏', likes: 18, time: '22h', liked: false },
    ],
  },
  {
    id: 'p6',
    user: { name: 'Karim Ben Salah', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', type: 'particulier', verified: false, location: 'Monastir, Corniche', followers: 156 },
    type: 'trouve',
    animal: { species: 'Perroquet', breed: 'Ara bleu', sex: 'male', age: 'Adulte', vaccinated: false, sterilized: false },
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=600&fit=crop' },
    ],
    caption: '🟢 Animal trouvé ! Ce magnifique perroquet a été trouvé ce matin sur la Corniche de Monastir. Il semble apprivoisé et en bonne santé. Si vous êtes le propriétaire ou connaissez le propriétaire, contactez-moi. Il est en sécurité chez moi 🦜',
    likes: 567, comments: 78, shares: 145, views: 5670,
    timestamp: '1j',
    liked: false, saved: false,
    commentsList: [
      { id: 'c9', author: 'Ahmed Tunis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', text: 'Partagé dans le groupe Monastir ! 👍', likes: 9, time: '20h', liked: false },
    ],
  },
  {
    id: 'p7',
    user: { name: 'Élevage Royal Canin TN', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face', type: 'eleveur', verified: true, location: 'Tunis, Cité Olympique', followers: 3240 },
    type: 'accouplement',
    animal: { species: 'Chien', breed: 'Berger Allemand', sex: 'female', age: '3 ans', size: 'Grand', vaccinated: true, sterilized: false },
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=600&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1617882624124-5c36a20b97f5?w=600&h=600&fit=crop' },
    ],
    caption: '🐕 Recherche mâle Berger Allemand pour accouplement. Notre femelle Alexa a 3 ans, pure lignée allemande, LOF, toutes vaccinations à jour. Nous recherchons un mâle de même qualité. Contactez-nous pour les modalités 🤝',
    likes: 234, comments: 31, shares: 12, views: 2100,
    timestamp: '2j',
    liked: false, saved: false,
    commentsList: [],
  },
  {
    id: 'p8',
    user: { name: 'Association APAN Tunisie', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', type: 'association', verified: true, location: 'Tunis', followers: 8920 },
    type: 'urgence',
    animal: { species: 'Chat', breed: 'Européen', sex: 'female', age: '1 an', vaccinated: false, sterilized: false },
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=600&fit=crop' },
    ],
    caption: '🔴 URGENCE MÉDICALE — Cette petite chatte a été trouvée blessée à Menzah 6. Elle a besoin d\'une opération urgente. Nous cherchons un parrain financier ou une clinique partenaire. Chaque partage peut lui sauver la vie. ❤️‍🩹',
    likes: 3420, comments: 289, shares: 1240, views: 34500,
    timestamp: '3j',
    liked: true, saved: true,
    commentsList: [
      { id: 'c10', author: 'Dr. Sonia Amor', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face', text: 'Contactez-moi en DM, ma clinique peut l\'accueillir en urgence 🏥', likes: 156, time: '2j', liked: false },
    ],
  },
];

export const SUGGESTIONS = [
  { id: 's1', name: 'Refuge Arc-en-Ciel', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face', type: 'refuge', followers: 2340 },
  { id: 's2', name: 'Dr. Leila Chaabane', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=60&h=60&fit=crop&crop=face', type: 'vet', followers: 5670 },
  { id: 's3', name: 'Élevage Prestige', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', type: 'eleveur', followers: 1890 },
];
