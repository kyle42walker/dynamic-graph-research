# Project Description
## Objectives
- Simulate mobile robots navigating within dynamically updating graphs
	- Implement robot navigation algorithms
	- Implement visualization to extract useful data from the simulation
		- Answer questions like "How many steps does it take the robots to explore *X* percent of the graph?"

## Definitions
- graph - a structure containing vertices with edges between them
- node/vertex - the fundamental unit of a graph
- edge - a link between two vertices
- agent/robot - autonomous entity which traverses between nodes via edges following an algorithm
- step - one unit of time in the simulation (agents can perform one move between adjacent vertices per step)
- $\lambda$ (lambda) - number of steps between edge reshuffling
- edge reshuffling - randomly marking a specified percentage of edges in a graph either traversable or not

## Tasks
Much of the groundwork for the simulation has been already been completed. The remaining work involves implementing graph navigation algorithms, extracting and visualizing useful data, and fleshing out the GUI. Some rough mockups of what the final GUI could look like are discussed in this document.

### Completed Tasks
These tasks have already been completed by Kyle Walker.
#### Key Deliverables
- Implement a time and memory efficient graph model
- Represent the graph visually
- Automatically generate different types of graphs from a given number of nodes and initial parameters
	- Path
	- Cycle
	- Complete
	- Erdos-Renyi Random Graph
	- Arbitrary Tree
	- Binary Tree
- Model robots navigating the graph
	- Random walk dispersion
	- Random walk exploration
	- Tree exploration with global communication
	- Arbitrary graph exploration with global communication
- Represent the robots' current positions in the graph visually
	- Change node color based on number of robots on a node
- Randomly toggle edges of the input graph every lambda rounds
- Allow robots to start at different nodes
- Ability to change robot behavior depending on state
- Ability to step through the simulation one round at a time

#### Optional Add-Ons
- Support moving node positions manually in the GUI
	- Can lock node positions in place
- Add edge and node weights for future experimentation
- Allow for both directed and undirected graph generation and traversal
- Show a list of all robots next to the graph view, and reveal the robot's full path history upon clicking the robot's icon/identifier

### Remaining Tasks
This is what still needs to be implemented
#### Key Deliverables
- Implement more robot algorithms
	- Still need to implement local communication models for tree and arbitrary graph traversal
- Include a way to scroll forward and backward in time through the simulation
	- Started working on a slider to move through simulated time steps, but it needs to be finished
- Plot the number of nodes visited over the number of steps taken (or phase)
	- Hovering the mouse over a position on the graph shows the X and Y coordinates for ease of analysis
- Save graph configurations in a recoverable format (e.g. CSV or JSON)

#### Optional Add-Ons
- Implement more graph generation algorithms
	- Random tree (maybe using a Prufer sequence)
	- Watts-Strogatz random graph
	- Barabasi-Albert random graph
- Ability to add/remove/destroy graph edges manually in the GUI
- Ability to manually generate a graph by placing nodes and edges in the GUI
- Support manually triggered dynamism, wherein the user controls when and where edges are changed each round
- Speed up the simulation with parallelization
	- Creating Node.js worker threads for each robot/cluster of robots may help
- Support a generic API that exposes the model data to write new algorithms in the future
- Have an option to enable grid lines in the GUI for ease of moving node positions
- Allow adding an image to the background of the graph view (e.g. a map or environment)
- Have a color selector to customize the appearance of the nodes and background
- Support exporting the graph as an image file (e.g. PNG or SVG)
- Visualize the individual steps of the robot algorithm (i.e. state what the robot is "thinking" and highlight any relevant edges/nodes when a robot is selected)
- Store entire simulation instance including sequence of graphs, robot paths, algorithms used on each robot, robot starting position
- Run the simulation from a command line interface without running the visualization to speed things up
	- Can have it output key results at the end

# Running the Code
## Prerequisite Setup
### WSL
- I recommend installing WSL 2 if you are running a Windows PC for ease of development, but this step is not necessary if you have another preferred workflow
- Type the following into PowerShell:
```powershell
wsl --install
```
- I am using Ubuntu 22.04.2 LTS at the time of writing this (WSL defaults to the latest stable release of Ubuntu)
### NVM, Node, and NPM
- Install NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
- Reboot WSL
- Run the following:
```bash
nvm ls-remote
nvm install node
```
### Vue
- Install Vue 3
- [How To Generate a Vue.js Single Page App With the Vue CLI | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-generate-a-vue-js-single-page-app-with-vue-create)
```bash
npm i -g @vue/cli
```
### v-network-graph Library
- Run `npm install v-network-graph`
- If this causes an upstream dependency conflict when running the code, delete node_modules and package-lock.json and try with --legacy-peer-deps
```bash
rm -r node_modules/
rm package-lock.json
npm install v-network-graph --legacy-peer-deps
```
### primevue
- I am using this for UI elements
- Install with `npm install primevue --legacy-peer-deps`

## Setup the Project Files
### Create the Project
- Clone the repository and run the create command from WSL in a directory one level above the repository
- This will populate any files excluded in the .gitignore
```bash
vue create research-su23
```
- Note: if you wish to change the project name, this is a good time to do it
	- Change the cloned repository name first, then run the `vue create` command with the new directory name
### Check that Everything Worked
- Run the server
```bash
cd research-su23
npm run serve
```
- View the results by typing `localhost:8080` into your web browser (tested on Edge and Chrome)

# Code Description
## Files
- All of the relevant files can be found under the src/ directory
### App.vue
- Runs the actual Vue app
- All the html and css is within this file, as well as some typescript to control the elements on the screen
- Note: this file was thrown together for rapid prototyping
	- I recommend splitting up the functionality of the application into different Vue components
		- I already started doing this with the separate RobotSelector.vue

### RobotSelector.vue
- This is under the components subdirectory
- This component handles the list of robots displayed under the graph visualization
- More components like this should be created to keep App.vue as small as possible
- Note: the provide, inject model used to share data between components may not be the best choice here
	- This was done to get something working quickly

### graph.ts
- Graph data structure and graph generation algorithms
- Several functions to access or modify aspects of the graph are included
- The underlying graph model is based on an incidence list
	- The graph has a list of nodes
		- Node index is each node's ID
	- Each node has a list of incident edges
		- Edge index is that edge's port number
	- Each edge has a target node's ID

### main.ts
- Main entry point
- Runs Vue application and imports necessary libraries

### model.ts
- The actual simulation model
	- This could be run separately without the visualization to run the simulation much more efficiently
- Wrapper around the graph and robots
- Has getters/setters for anything in the model that the visualization or a command line interface would need

### robot.ts
- Robot algorithms
- The RobotCoordinator is an abstract base class that manages robots and their movement
	- This class is implemented by specific robot coordinators used to simulate different behaviors

### visual_graph.ts
- Converts graph and robot data into v-network-graph supported format
- Allows the model to be visualized

# Next Steps
## Get Up to Speed
- Learn about Node: [Getting Started Guide | Node.js (nodejs.org)](https://direct.nodejs.org/en/docs/guides/getting-started-guide)
	- Learning about the different options for parallelism will be especially useful when trying to speed things up
		- Between Child Processes, Clusters, and Worker Threads, I believe Worker Threads would be most applicable
- Learn about Vue: [Introduction | Vue.js (vuejs.org)](https://vuejs.org/guide/introduction.html)
	- Try the tutorial: [Tutorial | Vue.js (vuejs.org)](https://vuejs.org/tutorial/#step-1)
- Learn about v-network-graph: [Getting Started | v-network-graph (dash14.github.io)](https://dash14.github.io/v-network-graph/getting-started.html)
- Read through the code so far and write out any questions that come up
- Step through the code (F12 while the program is open)

## GUI Design and Implementation
- Depending on what Billy and Amanda want, you may find it easiest to work the GUI first
- Understanding how to interpret the visualization will make implementing these algorithms easier
### Mockups
- Here's a very rough idea of what the GUI might look like: [Wireframe.cc](https://wireframe.cc/VdDU1D)
### Code
- I recommend using primevue for the UI elements
- Try to break each part of the screen down into separate vue components to maximize code reusability and clarity
	- I didn't break things down too much, as I was still in the prototyping phase, but you can be a better developer than me

# Conclusion
- This project is a great way to hone your skills in web development and learn more about graph algorithms
- You are especially lucky to be working with Amanda and Billy -- they have both been fantastic mentors to me
- If you have any questions about the code, feel free to reach out to me
	- I am always happy to help, and I am excited to see how this project evolves