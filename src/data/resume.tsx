import { Icons } from "@/components/icons";
import { url } from "inspector";
import { HomeIcon } from "lucide-react";

export const DATA = {
  name: "Winston Trinh",
  initials: "WT",
  url: "https://winston-trinh.github.io/index.html",
  location: "Los Angeles, CA",
  locationLink: "https://www.google.com/maps/place/losangeles",
  description:
    "Student at USC studying computer science. Passionate about full stack and mobile development, cloud computing, distributed data systems, and product management.",
  summary: [
    "I was born and raised in [Portland, OR](https://www.google.com/maps/place/portland). I currently live in Los Angeles studying [computer science at the University of Southern California](/#education).",
    "My work-study job is to work as a [TA for CS@SC](/#work) and I'm also a [research assistant for Professor Duquette](/#work). I love using technology to come up with creative solutions that can make a real difference in people’s lives—whether it’s through teaching others or personal projects. On the side, I like playing basketball, weightlifting, and trying new food."
  ],
    // "At the end of 2022, I quit my job as a software engineer to go fulltime into building and scaling my own SaaS businesses. In the past, [I pursued a double degree in computer science and business](/#education), [interned at big tech companies in Silicon Valley](https://www.youtube.com/watch?v=d-LJ2e5qKdE), and [competed in over 21 hackathons for fun](/#hackathons). I also had the pleasure of being a part of the first ever in-person cohort of buildspace called [buildspace sf1](https://buildspace.so/sf1).",
  avatarUrl: "/me.jpeg",
  skills: [
    "C/C++",
    "Java",
    "Python",
    "SwiftUI",
    "React.js",
    "Next.js",
    "Node.js",
    "Spring Boot",
    "Flask",
    "Git",
    "Docker",
    "Linux",
    "AWS EC2",
    "scikit-learn",
    "SQL",
    "Flutter",
    "TypeScript",
    "Maven",
    "JUnit",
    "Postman (REST)"
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
  ],
  contact: {
    email: "mailto:wntrinh@usc.edu",
    tel: "+1 (971) 727-5784",
    social: {
      email: {
        name: "Send Email",
        url: "mailto:wntrinh@usc.edu",
        icon: Icons.email,

        navbar: true,
      },
      GitHub: {
        name: "GitHub",
        url: "https://github.com/winston-trinh",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/winstontrinh/",
        icon: Icons.linkedin,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "USC Sol Price School of Public Policy",
      href: "http://www.nicolasduquette.com/index.html",
      badges: [],
      location: "Los Angeles, CA",
      title: "Research Assistant",
      logoUrl: "/price.jpeg",
      start: "July 2024",
      end: "Present",
      description: [
        "•	Processed and analyzed large-scale datasets exceeding 100 GB using Python and Polars to reduce data processing time.",
        "•	Developed and implemented predictive models using scikit-learn and linearmodels to support nonprofit budget forecasting analysis."
    ]},
    {
      company: "Sandlines",
      href: "https://sandlines.app",
      badges: [],
      location: "Remote",
      title: "Software Engineer Intern",
      logoUrl: "/sandlines.png",
      start: "August 2023",
      end: "July 2024",
      description: [
        "•	Collaborated with two other developers using Agile methods to ensure seamless synchronization between website and mobile app to improve candidate-voter communication and amplify voter impact in US elections.",
        "•	Built a full-stack landing page using Next.js to increase user engagement during beta testing phase.",
        "•	Implemented end-to-end database management by connecting landing page to Firebase Backend through Firestore API, which supports over 100 active users."

    ]},
    {
      company: "USC Viterbi School of Engineering",
      href: "https://summercamp.usc.edu",
      badges: [],
      location: "Los Angeles, CA",
      title: "Teaching Assistant for CS@SC",
      logoUrl: "/usc.jpeg",
      start: "June 2022",
      end: "July 2024",
      description: [
        "•	Lead weekly classes of up to 15 students spanning K-12th grade, teaching various computer science topics ranging from Scratch to Java/Python.",
        "•	Design lesson plans for 200+ students with interactive programming problems and homework to support practical learning.",
        "•	Advise in development of Game Design using Unity and Level 1 Python by recording 3 educational videos."

    ]},
    {
      company: "National Institutes of Health NIDDK",
      href: "https://med.stanford.edu/stepup/students-more.html",
      badges: [],
      location: "Forest Grove, OR",
      title: "Research Intern",
      logoUrl: "/nih.jpeg",
      start: "May 2019",
      end: "August 2021",
      description: [
        "•	Conducted research project with Cas9 protein technology on Leishmania parasites to identify potential drug therapies for Leishmaniasis, a neglected tropical disease. Published abstract and presented work to NIH faculty in Bethesda campus.",
        "•	Participated in 2019 and 2021 summer research program through Stanford University STEP-UP program.",
    ]},
  ],
  education: [
    {
      school: "University of Southern California",
      href: "https://www.usc.edu",
      degree: "Bachelor's of Science - Computer Science",
      logoUrl: "/usc.jpeg",
      start: " ",
      end: "Expected Dec 2024",
      description: [
        "Involvement: Zeta Phi Rho, HackSC, ACM, Data Science Club"
      ],
    },
  ],
  projects: [
    {
      title: "JoesTable",
      href: "https://github.com/winston-trinh/joestable",
      dates: "November 2023",
      active: true,
      description:
        "Coded an interactive web application with Yelp API for dynamic restaurant search and management, enabling users to find restaurants, add favorites, and schedule reservations.",
      technologies: [
        "Java",
        "Spring Boot",
        "MySQL",
        "HTML",
        "CSS",
        "JavaScript",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/winston-trinh/joestable",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/joestable.png",
      video: "",
    },
    {
      title: "Traveling Trojan",
      href: "https://github.com/winston-trinh/traveling-trojan",
      dates: "October 2023",
      active: true,
      description:
        "Finds the shortest path between a list of 20+ locations from a starting location to end.",
      technologies: [
        "C++",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/winston-trinh/traveling-trojan",
          icon: <Icons.github className="size-3" />,
        },
        //   type: "Website",
        //   href: "https://automatic.chat",
        //   icon: <Icons.globe className="size-3" />,
        // },
      ],
      image: "/traveling_trojan.png",
      video: "",
    },
    {
      title: "Cache Simulator",
      href: "https://github.com/winston-trinh/cachesim",
      dates: "October 2023",
      active: true,
      description:
        "A simulator to visualize the efficiency of caches in computing. Although this simulator may seem technical, this project is really about improving how quickly and efficiently a computer can access data.",
      technologies: [
        "C",
        "Shell",
        "Makefile",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/winston-trinh/cachesim",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/cache_sim.png",
      video: "",
    },
    {
      title: "SkateSafe",
      href: "",
      dates: "April 2023",
      active: true,
      description:
        "iOS application mirroring key functionalities of Waze for skateboarders/cyclists/pedestrians to report hazards using Firebase BaaS and iOS SDK (CoreLocation, MapKit, PhotoKit).",
      technologies: [
        "SwiftUI",
        "Firebase BaaS",
        "Figma",
      ],
      image: "/skatesafe.png",
      video: "",
    },
  ],
  hackathons: [
    {
      title: "DeveloperWeek Hackathon",
      dates: "February 3rd - 4th, 2018",
      location: "San Francisco, California",
      description:
        "Developed a web application which aggregates social media data regarding cryptocurrencies and predicts future prices.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/developer-week.jpg",
      links: [
        {
          title: "Github",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/cryptotrends/cryptotrends",
        },
      ],
    },
    {
      title: "HackDavis",
      dates: "January 20th - 21st, 2018",
      location: "Davis, California",
      description:
        "Developed a mobile application which allocates a daily carbon emission allowance to users to move towards a sustainable environment.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-davis.png",
      win: "Best Data Hack",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2018/white.svg",
      links: [
        {
          title: "Devpost",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://devpost.com/software/my6footprint",
        },
        {
          title: "ML",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/Wallet6/my6footprint-machine-learning",
        },
        {
          title: "iOS",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/Wallet6/CarbonWallet",
        },
        {
          title: "Server",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/Wallet6/wallet6-server",
        },
      ],
    },
    {
      title: "ETH Waterloo",
      dates: "October 13th - 15th, 2017",
      location: "Waterloo, Ontario",
      description:
        "Developed a blockchain application for doctors and pharmacists to perform trustless transactions and prevent overdosage in patients.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/eth-waterloo.png",
      links: [
        {
          title: "Organization",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/ethdocnet",
        },
      ],
    },
    {
      title: "Hack The North",
      dates: "September 15th - 17th, 2017",
      location: "Waterloo, Ontario",
      description:
        "Developed a virtual reality application allowing users to see themselves in third person.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-north.png",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
      links: [
        {
          title: "Streamer Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/justinmichaud/htn2017",
        },
        {
          title: "Client Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/dillionverma/RTSPClient",
        },
      ],
    },
    {
      title: "Hack The 6ix",
      dates: "August 26th - 27th, 2017",
      location: "Toronto, Ontario",
      description:
        "Developed an open platform for people shipping items to same place to combine shipping costs and save money.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-6ix.jpg",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
      links: [
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/ShareShip/ShareShip",
        },
        {
          title: "Site",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://share-ship.herokuapp.com/",
        },
      ],
    },
    {
      title: "Stupid Hack Toronto",
      dates: "July 23rd, 2017",
      location: "Toronto, Ontario",
      description:
        "Developed a chrome extension which tracks which facebook profiles you have visited and immediately texts your girlfriend if you visited another girls page.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/stupid-hackathon.png",
      links: [
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/nsagirlfriend/nsagirlfriend",
        },
      ],
    },
    {
      title: "Global AI Hackathon - Toronto",
      dates: "June 23rd - 25th, 2017",
      location: "Toronto, Ontario",
      description:
        "Developed a python library which can be imported to any python game and change difficulty of the game based on real time emotion of player. Uses OpenCV and webcam for facial recognition, and a custom Machine Learning Model trained on a [Kaggle Emotion Dataset](https://www.kaggle.com/c/challenges-in-representation-learning-facial-expression-recognition-challenge/leaderboard) using [Tensorflow](https://www.tensorflow.org/Tensorflow) and [Keras](https://keras.io/). This project recieved 1st place prize at the Global AI Hackathon - Toronto and was also invited to demo at [NextAI Canada](https://www.nextcanada.com/next-ai).",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/global-ai-hackathon.jpg",
      win: "1st Place Winner",
      links: [
        {
          title: "Article",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://syncedreview.com/2017/06/26/global-ai-hackathon-in-toronto/",
        },
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/TinySamosas/",
        },
      ],
    },
    {
      title: "Open Source Circular Economy Days Hackathon",
      dates: "June 10th, 2017",
      location: "Toronto, Ontario",
      description:
        "Developed a custom admin interface for food waste startup <a href='http://genecis.co/'>Genecis</a> to manage their data and provide analytics.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/open-source-circular-economy-days.jpg",
      win: "1st Place Winner",
      links: [
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/dillionverma/genecis",
        },
      ],
    },
    {
      title: "Make School's Student App Competition 2017",
      dates: "May 19th - 21st, 2017",
      location: "International",
      description: "Improved PocketDoc and submitted to online competition",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/make-school-hackathon.png",
      win: "Top 10 Finalist | Honourable Mention",
      links: [
        {
          title: "Medium Article",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://medium.com/make-school/the-winners-of-make-schools-student-app-competition-2017-a6b0e72f190a",
        },
        {
          title: "Devpost",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://devpost.com/software/pocketdoc-react-native",
        },
        {
          title: "YouTube",
          icon: <Icons.youtube className="h-4 w-4" />,
          href: "https://www.youtube.com/watch?v=XwFdn5Rmx68",
        },
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/dillionverma/pocketdoc-react-native",
        },
      ],
    },
    {
      title: "Waterloo Equithon",
      dates: "May 5th - 7th, 2017",
      location: "Waterloo, Ontario",
      description:
        "Developed Pocketdoc, an app in which you take a picture of a physical wound, and the app returns common solutions or cures to the injuries or diseases.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/waterloo-equithon.png",
      links: [
        {
          title: "Devpost",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://devpost.com/software/pocketdoc-react-native",
        },
        {
          title: "YouTube",
          icon: <Icons.youtube className="h-4 w-4" />,
          href: "https://www.youtube.com/watch?v=XwFdn5Rmx68",
        },
        {
          title: "Source",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/dillionverma/pocketdoc-react-native",
        },
      ],
    },
    {
      title: "StartHacks I",
      dates: "March 4th - 5th, 2017",
      location: "Waterloo, Ontario",
      description:
        "Developed at StartHacks 2017, Recipic is a mobile app which allows you to take pictures of ingredients around your house, and it will recognize those ingredients using ClarifAI image recognition API and return possible recipes to make. Recipic recieved 1st place at the hackathon for best pitch and hack.",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/starthacks.png",
      win: "1st Place Winner",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
      links: [
        {
          title: "Source (Mobile)",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/mattBlackDesign/recipic-ionic",
        },
        {
          title: "Source (Server)",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/mattBlackDesign/recipic-rails",
        },
      ],
    },
    {
      title: "QHacks II",
      dates: "February 3rd - 5th, 2017",
      location: "Kingston, Ontario",
      description:
        "Developed a mobile game which enables city-wide manhunt with random lobbies",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/qhacks.png",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
      links: [
        {
          title: "Source (Mobile)",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/dillionverma/human-huntr-react-native",
        },
        {
          title: "Source (API)",
          icon: <Icons.github className="h-4 w-4" />,
          href: "https://github.com/mattBlackDesign/human-huntr-rails",
        },
      ],
    },
  ],
} as const;
