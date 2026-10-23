export interface Role {
  title: string
  location: string
  start: string
  end: string
  bullets: string[]
}

export interface Company {
  company: string
  href: string
  logoUrl: string
  roles: Role[]
}

export interface ProjectLink {
  type: 'Website' | 'Source'
  href: string
}

export interface Project {
  title: string
  href?: string
  dates: string
  description: string
  technologies: string[]
  links: ProjectLink[]
  image: string
}

export interface Education {
  school: string
  href: string
  degree: string
  logoUrl: string
  end: string
  description: string
}

export interface SocialLink {
  name: string
  label: string
  url: string
}

export const DATA = {
  name: 'Winston Trinh',
  url: 'https://winstontrinh.com',
  location: 'Seattle, WA',
  locationLink: 'https://www.google.com/maps/place/seattle',
  description:
    'B.S. in Computer Science from USC. Passionate about full stack and mobile development, cloud computing, distributed data systems, and product management.',
  summary: [
    'I was born and raised in [Portland, OR](https://www.google.com/maps/place/portland). I graduated with a [B.S. in Computer Science from the University of Southern California](#education).',
    'I’m a [Sr. Specialist Member of Technical Staff at AT&T](#experience), where I started through the [Technology Development Program](#experience). I love using technology to build creative solutions that make a real difference, whether automating tedious workflows for my team or teaching new tools. Outside of work, you’ll find me playing basketball, hiking, or trying new food spots.',
  ],
  skills: [
    'Python', 'C/C++', 'Java', 'React.js', 'Next.js', 'Spring Boot', 'Flask', 'Git', 'Docker',
    'GitHub Actions', 'Linux', 'Jira', 'Bash', 'AWS EC2', 'AWS Lambda', 'AWS SNS', 'AWS DynamoDB',
    'scikit-learn', 'MySQL', 'PostgreSQL', 'SwiftUI', 'Flutter', 'JUnit', 'Postman',
  ],
  social: [
    {
      name: 'Email',
      label: 'Send Email',
      // RFC 6068 wants CRLF line breaks in mailto bodies.
      url: `mailto:winstontrinh4@gmail.com?subject=${encodeURIComponent('Website Inquiry')}&body=${encodeURIComponent('Hi Winston,\r\n\r\n')}`,
    },
    { name: 'GitHub', label: 'GitHub', url: 'https://github.com/winston-trinh' },
    { name: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/winstontrinh/' },
    { name: 'Resume', label: 'Resume', url: '/resume_winston_trinh.pdf' },
    { name: 'Blog', label: 'Blog', url: '/blog/' },
  ] satisfies SocialLink[],
  experience: [
    {
      company: 'AT&T',
      href: 'https://connect.att.jobs/technology-development-program',
      logoUrl: '/att.svg',
      roles: [
        {
          title: 'Sr. Specialist Member of Technical Staff',
          location: 'Seattle, WA',
          start: 'October 2026',
          end: 'Present',
          bullets: ['AI Workflow Automation'],
        },
        {
          title: 'TDP Network Engineer',
          location: 'Atlanta, GA',
          start: 'July 2025',
          end: 'September 2026',
          bullets: [
            'Technology Development Program - Focus on improving AT&T’s 5G and fiber infrastructure using scripting, automation and data analysis.',
            'RAN Architecture and Planning',
            'Systems Support, Quality Assurance and Testing - Recipient of Connection Award',
          ],
        },
      ],
    },
    {
      company: 'USC Sol Price School of Public Policy',
      href: 'http://www.nicolasduquette.com/index.html',
      logoUrl: '/price.webp',
      roles: [
        {
          title: 'Research Assistant',
          location: 'Los Angeles, CA',
          start: 'July 2024',
          end: 'Dec 2024',
          bullets: [
            'Processed and analyzed large-scale datasets exceeding 100 GB using Python and Polars to reduce data processing time.',
            'Developed and implemented predictive models using scikit-learn and linearmodels to support nonprofit budget forecasting analysis.',
          ],
        },
      ],
    },
    {
      company: 'USC Viterbi School of Engineering',
      href: 'https://summercamp.usc.edu',
      logoUrl: '/usc.webp',
      roles: [
        {
          title: 'Teaching Assistant for CS@SC',
          location: 'Los Angeles, CA',
          start: 'June 2022',
          end: 'July 2024',
          bullets: [
            'Lead weekly classes of up to 15 students spanning K-12th grade, teaching various computer science topics ranging from Scratch to Java/Python.',
            'Design lesson plans for 200+ students with interactive programming problems and homework to support practical learning.',
            'Advise in development of Game Design using Unity with C# and Level 1 Python by recording 3 educational videos.',
          ],
        },
      ],
    },
    {
      company: 'National Institutes of Health NIDDK',
      href: 'https://med.stanford.edu/stepup/students-more.html',
      logoUrl: '/nih.webp',
      roles: [
        {
          title: 'Research Intern',
          location: 'Forest Grove, OR',
          start: 'May 2019',
          end: 'August 2021',
          bullets: [
            'Conducted research project with Cas9 protein technology on Leishmania parasites to identify potential drug therapies for Leishmaniasis, a neglected tropical disease. Published abstract and presented work to NIH faculty in Bethesda campus.',
            'Participated in 2019 and 2021 summer research program through Stanford University STEP-UP program.',
          ],
        },
      ],
    },
  ] satisfies Company[],
  education: [
    {
      school: 'University of Southern California',
      href: 'https://www.usc.edu',
      degree: 'Bachelor of Science – Computer Science',
      logoUrl: '/usc.webp',
      end: 'December 2024',
      description: 'Involvement: Zeta Phi Rho, HackSC, ACM, Data Science Club',
    },
  ] satisfies Education[],
  projects: [
    {
      title: 'Bubble Social',
      href: 'https://bubbleapp.me',
      dates: 'March 2025',
      description:
        'Built a rate limiting backend, enabling precise control over API usage across different routes and users. Developed RPC functions to enforce dynamic request quotas and automated testing with a Bash script simulating real-time API traffic with seed data.',
      technologies: ['Bash', 'PostgreSQL', 'PL/SQL', 'React Testing Library'],
      links: [{ type: 'Website', href: 'https://bubbleapp.me' }],
      image: '/bubble.webp',
    },
    {
      title: 'UCLA Schedule Checker',
      dates: 'February 2025',
      description:
        "Reverse-engineered UCLA's course scheduling site by analyzing browser network activity to replicate undocumented API requests. Deployed cURL-based polling logic in AWS Lambda, storing results in DynamoDB and sending seat availability alerts via SNS alerts.",
      technologies: ['Python', 'AWS Lambda', 'AWS DynamoDB', 'AWS SNS'],
      links: [],
      image: '/ucla.webp',
    },
    {
      title: 'JoesTable',
      href: 'https://github.com/winston-trinh/joestable',
      dates: 'November 2023',
      description:
        'Coded an interactive web application with Yelp API for dynamic restaurant search and management, enabling users to find restaurants, add favorites, and schedule reservations.',
      technologies: ['Java', 'Spring Boot', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
      links: [{ type: 'Source', href: 'https://github.com/winston-trinh/joestable' }],
      image: '/joestable.webp',
    },
    {
      title: 'Traveling Trojan',
      href: 'https://github.com/winston-trinh/traveling-trojan',
      dates: 'October 2023',
      description: 'Finds the shortest path between a list of 20+ locations from a starting location to end.',
      technologies: ['C++'],
      links: [{ type: 'Source', href: 'https://github.com/winston-trinh/traveling-trojan' }],
      image: '/traveling_trojan.webp',
    },
    {
      title: 'Cache Simulator',
      href: 'https://github.com/winston-trinh/cachesim',
      dates: 'October 2023',
      description:
        'A simulator to visualize the efficiency of caches in computing. Although this simulator may seem technical, this project is really about improving how quickly and efficiently a computer can access data.',
      technologies: ['C', 'Shell', 'Makefile'],
      links: [{ type: 'Source', href: 'https://github.com/winston-trinh/cachesim' }],
      image: '/cache_sim.webp',
    },
  ] satisfies Project[],
}
