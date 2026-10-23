import { Mermaid } from '../Mermaid'
import { TEST_COUNT as N } from '../posts'
import styles from '../Blog.module.css'

const ARCHITECTURE = `flowchart LR
  subgraph prep["The kitchen: done once, ahead of time"]
    photo["Original portrait"] --> ai[("AI face model")]
    ai --> frames["121 gaze photos"]
    content["Resume content file"]
  end
  subgraph browser["The table: your browser"]
    content --> page["Portfolio page"]
    frames --> face["Interactive face"]
    face --> page
  end`

const PIPELINE = `flowchart LR
  push["I publish a change"] --> tests{"Run all ${N} tests"}
  tests -- "All pass" --> build["Build the site"] --> live["Go live"]
  tests -- "Any fail" --> stop["Turned away. Nothing changes"]`

function Figure({ n, caption, children }: { n: number; caption: string; children: React.ReactNode }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>{children}</div>
      <figcaption>
        <b>Figure {n}.</b> {caption}
      </figcaption>
    </figure>
  )
}

export function BuildingAPortfolio() {
  return (
    <>
      <p className={styles.lead}>
        Here’s a fun fact about recruiters: they look at a lot of portfolios. Most of those portfolios are lists of jobs
        and skills, and after a while they start to blend together. So when I rebuilt mine this fall, I gave myself one
        goal. Make people smile in the first second, then get out of their way.
      </p>
      <p>
        My answer was a photo of me that watches your cursor. Move your mouse to the left and I look left. Move it up and
        I glance up. This post is the story of how that works, and of the quieter work that keeps the whole site from
        falling over.
      </p>

      <h2>The whole site in one picture</h2>
      <p>
        Think of it like a restaurant. The cooking happens in the kitchen before you arrive, and you only get the
        finished plate. All the slow, expensive work, like creating the photos, happens once on my computer. Your browser
        just receives the finished files, which is why the page loads quickly. All of the words on the site, from job
        titles to projects, live in a single file, so updating my resume never means rearranging the page.
      </p>
      <Figure n={1} caption="Heavy lifting happens in the kitchen. Your browser only plates the dish.">
        <Mermaid chart={ARCHITECTURE} label="Diagram: the portrait goes through an AI face model once to make 121 gaze photos. In the browser, those photos and the resume content file make up the portfolio page." />
      </Figure>

      <h2>121 selfies and a flipbook</h2>
      <p>
        Remember flipbooks, where you flick through pages and a drawing seems to move? The face works the same way. I
        made 121 photos of myself, each looking in a slightly different direction, arranged like an 11 by 11
        checkerboard. When you move your mouse, the site finds the photo looking closest to your cursor and flips to it.
        Each photo is about the size of a short email, and they quietly load in the background, so by the time you move
        your mouse, they’re ready.
      </p>
      <Figure n={2} caption="Nine of the 121 photos. The one in the middle is the real, unedited me.">
        <img
          className={styles.grid}
          src="/blog/gaze-grid.webp"
          alt="Nine portraits of Winston in a three by three grid. In each one his eyes and head point toward that position: up-left in the top-left image, straight ahead in the center, down-right in the bottom-right."
          width={768}
          height={768}
          loading="lazy"
        />
      </Figure>

      <h3>Version one: the googly eyes</h3>
      <p>
        My first attempt skipped AI entirely. I wrote a program that found the colored part of my eyes and slid it a few
        pixels left or right. It worked, in the way that a cardboard cutout technically resembles a person. I’m smiling in
        my photo, so my eyes are narrow and there was barely room to move anything. And real people don’t just move their
        eyes. Their heads turn a little, and their eyebrows rise when they look up. Mine stayed frozen. The effect was less
        “friendly engineer” and more “haunted portrait in a museum.”
      </p>
      <p>
        So I switched to an AI model that edits faces. It can turn the head, shift the gaze and nudge the expression, all
        from a single real photo. I kept every change small on purpose. Push it too far and it stops looking like me.
      </p>

      <h2>Borrowing from Apple’s playbook</h2>
      <p>
        With the face doing all the showing off, everything else needed to be calm. I took cues from Apple: big
        headlines, lots of breathing room, one accent color, and motion that feels like it has a little weight. The site
        has a light mode and a dark mode, and if your phone is set to reduce motion, the animations politely sit still. So
        does my face.
      </p>

      <h2>Quality: the part nobody sees</h2>
      <p>This is the part I’m proudest of, and no visitor will ever notice it. That’s kind of the point.</p>

      <h3>{N} tiny robot testers</h3>
      <p>
        Imagine hiring {N} very patient interns whose only job is to use your website and report anything strange. That’s
        what automated tests are, minus the coffee budget. Each one is a small program that pretends to be a visitor. One
        moves the mouse to the top corner and checks that I look up. One makes sure all 121 photos actually exist. Others
        flip to dark mode, open the phone menu, and confirm the email button fills in the subject line. Every time I
        change anything, all {N} run in a few seconds.
      </p>

      <h3>The bugs they caught</h3>
      <p>
        When I went from 49 photos to 121, three testers immediately raised their hands. They had the old number
        memorized, so they were looking for photos that no longer existed. Instead of teaching them the new number, I
        taught them to look it up in the same place the website does. Next time the grid changes, they’ll keep up on
        their own.
      </p>
      <p>
        Another tester tripped over something subtler. My code quietly assumed that things would happen in a particular
        order. A real browser would almost never break that assumption, but “almost never” is a scary phrase in software.
        I rewrote that part so the order doesn’t matter at all.
      </p>

      <h3>The bug they missed</h3>
      <p>
        Robots are great at checking what you told them to check. They are terrible at noticing what you didn’t. So I
        also opened the site myself on desktop and phone sizes, in light and dark mode. On a phone, the menu turned out to
        be see-through, with the page showing through the links like a ghost. All the tests passed. A human would have
        spotted it in one second. I fixed it before launch.
      </p>

      <h3>Measure twice, generate once</h3>
      <p>
        The AI charges for each photo, so before ordering 121, I ordered one and checked that “look up” actually looked
        up. Then, while starting the full batch, the program said it had “72 to generate.” I expected 121, and that gap
        bugged me. It turned out the program was about to keep 49 photos from the googly-eye version, because they shared
        the same file names as the new ones. If I had shrugged and let it run, about a third of my face grid would have
        been the haunted museum portrait. I cleared out the old photos and started fresh.
      </p>

      <h3>When the AI said “slow down”</h3>
      <p>
        Even then, the first full run didn’t finish cleanly. The AI service limits how quickly you can send requests, a
        bit like a coffee shop that only takes so many orders a minute, and 23 photos didn’t make it. Luckily, I’d built
        the program to remember what it had already finished. Running it again ordered only the missing 23, not all 121
        from scratch.
      </p>

      <h3>A bouncer at the door</h3>
      <p>
        All of this only helps if it runs every time, including the times I forget. So the site has a bouncer. Every
        update has to pass all {N} tests before it’s allowed onto the live site. One failure, and the bouncer turns it
        away.
      </p>
      <Figure n={3} caption="The bouncer. Updates go live automatically, but only if every test passes.">
        <Mermaid chart={PIPELINE} label={`Diagram: a published change runs all ${N} tests. If all pass, the site is built and goes live. If any fail, nothing changes.`} />
      </Figure>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.num}>{N}</span>
          <span className={styles.label}>tests, run on every change in a few seconds</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.num}>55 KB</span>
          <span className={styles.label}>of compressed code runs the homepage, less than one phone photo</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.num}>2.6 MB → 20 KB</span>
          <span className={styles.label}>for the USC logo after I shrank the images</span>
        </div>
      </div>

      <h2>What I learned</h2>

      <h3>Build the simple version, even if it’s wrong</h3>
      <p>
        The googly-eye version went straight into the trash, and I’m glad I built it anyway. Seeing it fail showed me
        exactly what “realistic” needed: head movement and expression, not just eyes. If I’d jumped straight to AI, I
        wouldn’t have known what to ask it for.
      </p>

      <h3>When a number looks off, stop</h3>
      <p>
        “72 to generate” was one short line of text, easy to ignore. Most of the bugs I’ve run into didn’t arrive with
        alarms going off. They showed up as something slightly odd that nobody stopped to question. Now when a number
        surprises me, I find out why before I keep going.
      </p>

      <h3>Keep every fact in one place</h3>
      <p>
        The testers who memorized the old photo count taught me a simple rule: if a fact lives in two places, one of them
        will eventually be wrong. My resume follows the same rule. When I grouped my two AT&amp;T roles under one heading,
        I changed one file and the whole site updated to match.
      </p>

      <h3>Robots check, humans notice</h3>
      <p>
        Automated tests are wonderful, and I’d never ship without them. But the see-through menu reminded me that someone
        still has to actually look at the thing. I now check the real page on a real screen size, in both color modes,
        before I call anything done.
      </p>

      <h3>Small details are most of the work</h3>
      <p>
        My first idea for the menu was to make the current section bold as you scroll. Then I realized bold letters are
        wider, so every other link would shuffle sideways a few pixels each time. It’s the kind of jitter you can’t name
        but definitely feel. I used a small underline instead. Same story with my first photo crop, which politely removed
        my chin, and the 2.6 MB logo.
      </p>
      <p>
        Links got the same treatment. Underlines felt like a website from 2005, so company names, school names and the
        contact buttons now grow slowly when you point at them, and their logos and icons give a small, springy bounce.
        It’s one consistent gesture that says “yes, you can click this,” used everywhere. None of these fixes were hard.
        They just needed someone to care.
      </p>

      <p>
        Want to see it in person? Head back to the <a href="/">homepage</a> and wave your mouse around. I’ll be watching.
        In the friendly way. And if you spot something off, the email button will even fill in the subject line for you.
      </p>
    </>
  )
}
