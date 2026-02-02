SkillSphere README. Module Information  
Module Code: COM4113  
Module Title: Tech Stack  
Institution: Leeds Trinity University

Project Overview  
SkillSphere is a website providing individuals with sharing skills and information to allow them to learn together. Guests browse the platform without needing to register, and if you sign up, you unlock new features, such as personalized profiles and messaging. Building it, SkillSphere proves the ways for building a scalable simple and sustainable front-end using these web development tools. Since there is currently no backend, we perform UI (User Interface) and interact on users based on simulated data. These features include displaying user flows on display, rapid responsive design, user-friendly navigation, and conditional access to the applications using users’ authentication credentials. In the future backend services, authentication servers and databases are also planned.

The Choice of Tech Stack  
React vs Other Frameworks  
React appeals to us for its close-knit community, small, modular design, component-oriented approach, and its potential for building reusable and extensible components (DigitalOcean, 2025). Other frameworks considered:  
Vue.js: Use it to create your apps with minimal learning curve. Svelte: Compiles to simple JavaScript which is faster and smaller. Angular: Great for a very large codebase; complicated but powerful. SolidJS/Qwik: Fast & low cost short and very efficient app frameworks. React sits somewhere between speed, maintainability and community support.

Vite vs Other Build Tools  
We chose Vite because it is easy and fast to set up (TatvaSoft Blog, 2024). Other tools considered:  
Webpack: More powerful but slower to set up, run or configure. Turbopack: New one, also good for building large apps, but less mature. Parcel: Very basic but a lack of plugin and community support.

Tailwind CSS vs Other CSS Frameworks  
Tailwind CSS – Consistent CSS styling, versatility, and adaptability (Mike Codeur, 2024). Other frameworks explored:  
Bootstrap: More restrictive than the normal CSS, where only things that have been compiled are to be used. Windi CSS - Similar to Tailwind, but much faster and easier to compile. Materialize CSS/Bulma: Pre-packaged assets that are unsuited for dynamic builds. We have React Router for routing, this means that our users can move up and down between pages in a matter of seconds.

Server-Side Ideas  
SkillSphere, which is an app that you are going to create on the front-end, is now advisable for server-side programming. Because we have sign-up of users, data persisted, then content moderation, a well-architected backend is necessary. For example, we might implement MongoDB and a RESTful API to enable dynamic storage of content from user generated documents, and user personal profiles & messages – and sharing resources. Key considerations include:

Conduct safe handling of privacy sensitive personal information (hashed passwords, sensitive user information, like hashed passwords and secrets). Input validation on data integrity and error handling and fault tolerance. We were able to get better performance through caching and fast database queries. Server side logging and performance measurement to spot and correct problems before they escalate. Additionally, we will help you plan ahead for building a secure, maintainable, and scalable backend that is available and easy to implement later on (DigitalOcean, 2025; DEV Community, 2024).

Server-Side Framework  
Node.js with Express: A simple, JavaScript-powered backend with React front end support. Django: It is a framework written in structured Python. It has an automated user authentication and automated admin for database management. Firebase: Backend cloud + real-time database orchestration, easy to manage: more manageable components, less customised parts of information processing. Node.js/Express - some combination is chosen because it is adaptable and useful to the community; it obviously comes with a lot of work since we know it doesn't help you do a lot of your job.

Development Standards and Versioning Standard  
Git and GitHub versioning were deployed. This helped us identify the right-and-wrong solution, make sure our project was finished in time with good quality assurance. We performed a reliability check to discover whether or not there are missing features and bugs. The confidence in rollback capability is maintained, so the project could be delivered on time (GitLab, 2025; Zemith, 2025; Nerdify Blog, 2025) and the project release timelines maintained in good condition.

Installation Instructions  
According to npm install dependencies as per npm install. With npm run dev for new command line to get started on dev server. Check your terminal open the local address in the browsers. Typical Issue: Non-compatible Node.js versions could lead to errors. This will also necessitate the refresh of our version of the new LTS.

Project Plan and Timeline  
Development was a nine-week iterative process:  
1) Phase 1: Needs analysis, tech review and design phase for the user experience.  
Phase 2: Environment Design using Vite and React; Initial phase of layout and navigation.  
Phase 3: Feature design on mock data and profiles and communication as conditional views.  
Phase 4: Stylization, usability, re-specification and re-design of documentation and testing on mobile/desktop devices were conducted.  
Gantt style chart: (src/images/Gantt-style_timeline.png).

User Journey of Interaction  
The guests can browse knowledge, skills and resources whenever they want without the need to sign up. Users log in or sign in, then interact with tools, like their profiles and messaging — there is a sign-up button at the top right. The site is a convenience platform and it’s not currently allowing those who have not signed up, but it will. E. LEGAL, ETHICAL AND RISKS PRACTICES THINKING. GDPR, Data protection: Compliance with GDPR is planned for the future. We must collect user data with explicit consent, clear privacy-based principles, and it will be confidential for a while (AuditBoard, 2025; European Commission, 2025; GDPR Local, 2025). Ethical tradeoff: Open browsing increases user access but without means to moderate content makes usage an ideal environment for abuse, and decreases users trust (inappropriate or deceptive content) and hence lack of moderation. To address the risk, we will develop reporting and moderation policies that will be followed up on in future releases. Risk Assessment. Current risks include:

No ongoing data storage. No server-side validation. Reliance on mock data. Backend integration with secure APIs, authentication and database support will make sure that this risk is eliminated. Good Software Attributes. Keepability: components in React are modular. Readability: Same naming codes for all names. Usability: A simple simple GUI on the web. Efficiency: Tuning for the now and next

Real-World Applications. SkillSphere can be found in Community Education sites

Hobbyist Networks and Peer Learning

SkillSphere also targets informal professional skill-sharing communities, enabling users to connect and share knowledge efficiently.

Areas for Future Scaling

Permanent Data: Backend API and MongoDB for data persistence.
Authentication and Messaging: Integration for secure login and real-time messaging.
Resource Management: Tools for managing skills/resources.
Recommendations, Ratings, Saved Resources, AI Alerts: Future features to improve engagement and discoverability.

Post-MVP Enhancements

Messaging Functionality: Users can simulate chat sessions where logged-in users send and receive messages via React.
Reason: To manage state in a more responsive way and enable conditional rendering for community interaction.
Future: With backend storage, real-time updates and multi-user communication will be possible.

Ratings and Reviews: Skills/Resources can be rated by users. Ratings are stored in React state and displayed next to each resource.
Reason: Ratings improve discoverability and trust while demonstrating dynamic input handling, component updates, and state management.
Future: Backend storage will allow aggregation and calculation of average scores per resource.

Search and Filter Skills/Resources

Users can filter skills/resources via a search bar using keywords or combined queries such as “skills + personal knowledge + resources,” implemented with React state and array filtering.
Reason: Search enhances user experience, navigation, and interactivity. It also demonstrates how React can manipulate and display data dynamically.
Future Work: Backend integration will allow dynamic queries, flexible feature generation, and advanced filtering.

Inline Comments

Inline comments in SkillSphere highlight key parts of the code, showing what was added, removed, or how functions behave.

React components include comments on props received and their intended use.

Short descriptions of state updates and conditional rendering functions explain why they exist.

Comments describe messaging, ratings, and search/filter functionality, demonstrating React state in interactive simulations.

Routing and navigation logic is annotated to show which components render on which paths and how conditional access is handled.

These inline comments improve code quality and clarity, providing future developers insight into the logic flow and blockers addressed during development.

Site Map

Home
├─ Browse Skills/Resources
├─ Signup/Login ──> Profile (User)
│ ├─ Messaging
│ └─ Saved Resources / Ratings
└─ Search / Filter

Gantt-style chart placeholder: [Insert image of the project timeline here]
Site map diagram placeholder: [Insert the Figma or flowchart here]

AI Usage Declaration

Generative AI techniques were used to review documentation and code for clarity, layout, and error checking. All application code and documentation were authored by the developer, with AI used solely for review and refinement.

References

AuditBoard. (2025). The GDPR compliance framework: What you need to know in 2025. Retrieved from https://auditboard.com/blog/gdpr-compliance-framework

DigitalOcean. (2025, May 14). How To Set Up a React Project with Vite for Fast Development. Retrieved from https://www.digitalocean.com/community/tutorials/how-to-set-up-a-react-project-with-vite

DEV Community. (2024, August 10). React + Vite: why use? Retrieved from https://dev.to/doccaio/react-vite-why-use-cg2

European Commission. (2025). Data protection - European Commission. Retrieved from https://commission.europa.eu/law/law-topic/data-protection_en

GDPR Local. (2025). GDPR compliance for apps: A 2025 guide. Retrieved from https://gdprlocal.com/gdpr-compliance-for-apps/

GitLab. (2025). What are Git version control best practices? Retrieved from https://about.gitlab.com/topics/version-control/version-control-best-practices/

Mike Codeur. (2024, December 13). Getting Started with React and Vite: The Complete Guide. Retrieved from https://blog.mikecodeur.com/en/post/getting-started-with-react-and-vite-the-complete-guide

Nerdify Blog. (2025). 8 essential version control best practices for 2025. Retrieved from https://getnerdify.com/blog/version-control-best-practices/

TatvaSoft Blog. (2024, July). Vite vs Create-React-App: A Detailed Comparison. Retrieved from https://www.tatvasoft.com/outsourcing/2024/07/vite-vs-create-react-app.html

Zemith. (2025). 8 version control best practices for teams in 2025. Retrieved from https://www.zemith.com/en/blogs/version-control-best-practices