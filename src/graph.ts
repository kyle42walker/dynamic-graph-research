/*
graph.ts -- Graph data structure and graph generation algorithms.
The Graph class is a wrapper around a list of nodes, each of which contains a list of incident edges.
The edges describe the target node by its index in the list of nodes.
The index of the edge in the list of edges is the port number of the edge.
The GraphGenerator class contains static methods for generating graphs with various properties.

Authors:
  Kyle Walker

Note: time complexity for some functions has been commented.
  V is the number of vertices (nodes) in the graph
  D is the degree (number of edges) of a given node in the graph
  E is the number of edges in the graph
*/

// Custom types used in the Graph structure
type Edge = {weight: number, targetNode: number}
export type Vertex = {weight: number, edges: Edge[]}

export class Graph {
  nodes: Vertex[] = []
  // True if the graph edges are directed
  isDirected: boolean

  constructor (isDirected = false) {
    // Set the graph properties
    this.isDirected = isDirected
  }

  deepCopyNodes (): Vertex[] {
    // Return a deep copy of the nodes array
    // Time complexity: O(|V|)

    // Going to and from JSON is a quick way to deep copy an array
    return JSON.parse(JSON.stringify(this.nodes))
  }

  addNode (nodeWeight = 1) {
    // Add a node of specified weight to the graph
    // Time complexity: O(1) amortized
    this.nodes.push({ weight: nodeWeight, edges: [] })
  }

  addEdge (sourceId: number, targetId: number, edgeWeight = 1) {
    // Add an edge of specified weight from the source node to the target node
    // Time complexity: O(1) amortized
    // Assumes sourceId and targetId are valid and an edge between them is not already present (adding the check would make the time complexity O(|D| + |V|)
    this.nodes[sourceId].edges.push({ weight: edgeWeight, targetNode: targetId })

    if (this.isDirected) { return }

    this.nodes[targetId].edges.push({ weight: edgeWeight, targetNode: sourceId })
  }

  removeNode (nodeId: number) {
    // Remove the node with the specified id from the graph
    // Time complexity: O(|V| * |E|)
    // Assumes nodeId is valid

    // Remove the node
    this.nodes.splice(nodeId, 1)

    // Remove the relevant edges
    this.nodes.forEach((node) => {
      node.edges.forEach((edge, i) => {
        // Remove all edges that point to the removed node
        if (edge.targetNode === nodeId) {
          node.edges.splice(i, 1)
        }

        // Update all edges that point to nodes after the removed node
        if (edge.targetNode > nodeId) {
          edge.targetNode--
        }
      })
    })
  }

  removeEdge (sourceId: number, targetId: number) {
    // Remove the edge between the source and target nodes
    // Time complexity: O(|D|)
    // Assumes sourceId and targetId are valid and the edge exists

    // Remove the edge using splice to avoid creating a new array
    const edgeIndex = this.nodes[sourceId].edges.findIndex(edge => edge.targetNode === targetId)
    this.nodes[sourceId].edges.splice(edgeIndex, 1)

    if (this.isDirected) { return }

    const reverseIndex = this.nodes[targetId].edges.findIndex(edge => edge.targetNode === sourceId)
    this.nodes[targetId].edges.splice(reverseIndex, 1)
  }

  setNodeWeight (nodeId: number, weight: number) {
    // Set the weight of the node with the specified id
    // Time complexity: O(1)
    // Assumes nodeId is valid
    this.nodes[nodeId].weight = weight
  }

  setEdgeWeight (sourceId: number, targetId: number, weight: number) {
    // Set the weight of the edge between the source and target nodes
    // Time complexity: O(|D|)
    // Assumes sourceId and targetId are valid and the edge exists
    const edge = this.nodes[sourceId].edges.find(edge => edge.targetNode === targetId)
    if (edge) { edge.weight = weight }

    if (this.isDirected) { return }

    const reverseEdge = this.nodes[targetId].edges.find(edge => edge.targetNode === sourceId)
    if (reverseEdge) { reverseEdge.weight = weight }
  }

  setRandomEdgeWeightSigns (probabilityOfPositiveEdgeWeight: number) {
    // Randomly set the signs of the edge weights
    // Time complexity: O(|V| * |E|)
    this.nodes.forEach((node, sourceId) => {
      node.edges.forEach((edge) => {
        if (Math.random() < probabilityOfPositiveEdgeWeight) {
          this.setEdgeWeight(sourceId, edge.targetNode, Math.abs(edge.weight))
        } else {
          this.setEdgeWeight(sourceId, edge.targetNode, -Math.abs(edge.weight))
        }
      })
    })
  }

  getNodeIds (): number[] {
    // Return a list of all node ids
    // Time complexity: O(|V|)
    return this.nodes.map((_, i) => i)
  }

  getNodeWeight (nodeId: number): number {
    // Return the weight of the node with the specified id
    // Time complexity: O(|1|)
    return this.nodes[nodeId].weight
  }

  getEdgeWeight (sourceId: number, targetId: number): number {
    // Return the weight of the edge between the source and target nodes
    // Time complexity: O(|D|)
    const edge = this.nodes[sourceId].edges.find(edge => edge.targetNode === targetId)
    if (edge) { return edge.weight }

    return 0
  }

  getEdgeWeightFromPort (nodeId: number, port: number): number {
    // Return the weight of the edge from the specified port of the node
    // Time complexity: O(|1|)
    return this.nodes[nodeId].edges[port].weight
  }

  getNumberOfPorts (nodeId: number): number {
    // Return the number of ports on the node with the specified id
    // Time complexity: O(1)
    // Ports are the indices of the edges in the node's edge array
    return this.nodes[nodeId].edges.length
  }

  getNodeCount (): number {
    // Return the number of nodes in the graph
    // Time complexity: O(1)
    return this.nodes.length
  }

  getEdgeCount (): number {
    // Return the number of edges in the graph
    // Time complexity: O(|V|)
    const count = this.nodes.reduce((acc, node) => acc + node.edges.length, 0)
    return this.isDirected ? count : count / 2
  }

  getAdjacentNodes (nodeId: number): number[] {
    // Return a list of all nodes adjacent to the node with the specified id
    // Time complexity: O(|D|)
    return this.nodes[nodeId].edges.map(edge => edge.targetNode)
  }

  getChildNodes (nodeId: number, parentId: number): number[] {
    // Return a list of all adjacent nodes except the specified 'parent' node
    // Useful for tree graphs
    // Time complexity: O(|D|)
    return this.getAdjacentNodes(nodeId).filter(node => node !== parentId)
  }

  getChildPorts (nodeId: number, parentPort: number): number[] {
    // Return a list of all ports except the one that leads to the parent node
    // Useful for tree graphs
    // Time complexity: O(|D|)
    return [...Array(this.getNumberOfPorts(nodeId)).keys()].filter(port => port !== parentPort)
  }

  getAdjacentNodeFromPort (nodeId: number, port: number): number {
    // Return the id of the adjacent node connected to the specified of port number of the given node
    // Time complexity: O(1)
    return this.nodes[nodeId].edges[port].targetNode
  }

  getPortFromAdjacentNode (nodeId: number, adjacentNodeId: number): number {
    // Return the port number of the edge connecting the given node to the specified adjacent node
    // Time complexity: O(|D|)
    // Return -1 if the edge is not found
    return this.nodes[nodeId].edges.findIndex(edge => edge.targetNode === adjacentNodeId)
  }

  getShortestPath (sourceId: number, targetId: number): number[] {
    // Return the shortest path (found via BFS) from the source node to the target node as a list of nodes in the path
    // Return [] if no path exists
    // Time complexity: O(|V| + |E|)
    const visited: boolean[] = new Array(this.getNodeCount()).fill(false)
    const queue: number[] = []
    const previousNode: number[] = []
    const path: number[] = []

    // BFS
    queue.push(sourceId)
    visited[sourceId] = true

    while (queue.length > 0) {
      const currentNode = queue.shift() as number

      if (currentNode === targetId) { break }

      this.getAdjacentNodes(currentNode).forEach((adjacentNode) => {
        if (!visited[adjacentNode]) {
          visited[adjacentNode] = true
          previousNode[adjacentNode] = currentNode
          queue.push(adjacentNode)
        }
      })
    }

    // Reconstruct the path
    let currentNode = targetId
    while (currentNode !== undefined) {
      path.unshift(currentNode)
      currentNode = previousNode[currentNode]
    }
    if (path[0] !== sourceId) { return [] }

    return path
  }

  getDistanceBetweenNodes (sourceId: number, targetId: number): number {
    // Return the distance (number of nodes in the shortest path) between the source node and the target node
    // Time complexity: O(|V| + |E|)
    const shortestPath = this.getShortestPath(sourceId, targetId)
    if (shortestPath.length === 0) { return Infinity }
    return shortestPath.length - 1
  }

  getDepth (rootId: number): number {
    // Return the depth of the tree rooted at the specified node
    // Time complexity: O(|V| + |E|)
    // Assumes the graph is a tree
    const visited: boolean[] = new Array(this.getNodeCount()).fill(false)
    const queue: number[] = []
    const depth: number[] = []

    queue.push(rootId)
    depth[rootId] = 0

    while (queue.length > 0) {
      const currentNode = queue.shift() as number
      visited[currentNode] = true

      this.getAdjacentNodes(currentNode).forEach((adjacentNode) => {
        if (!visited[adjacentNode]) {
          queue.push(adjacentNode)
          depth[adjacentNode] = depth[currentNode] + 1
        }
      })
    }

    return Math.max(...depth)
  }

  isConnected (): boolean {
    // Return true if the graph is connected
    // Time complexity: O(|V| + |E|)
    const visited: boolean[] = new Array(this.getNodeCount()).fill(false)
    const queue: number[] = []

    queue.push(0)

    while (queue.length > 0) {
      const currentNode = queue.shift() as number
      visited[currentNode] = true

      this.getAdjacentNodes(currentNode).forEach((adjacentNode) => {
        if (!visited[adjacentNode]) {
          queue.push(adjacentNode)
        }
      })
    }

    return visited.every(node => node)
  }

  areAdjacent (sourceId: number, targetId: number): boolean {
    // Return true if the source node and target node are adjacent
    // Time complexity: O(|D|)
    return this.nodes[sourceId].edges.some(edge => edge.targetNode === targetId)
  }
}

export class GraphGenerator {
  static generateErdosRenyiRandomGraph (nodeCount: number, edgeProbability: number, isDirected = false, allowSelfLoops = false, requireConnected = false, maxAttempts = 10): Graph {
    // Generate a random graph using the Erdos-Renyi model
    //    nodeCount: number of nodes in the graph
    //    edgeProbability: probability of an edge between any two nodes
    //    isDirected: true if the graph edges are directed
    //    allowSelfLoops: true if the graph can contain self-loops (loops from a node to itself)
    //    requireConnected: true if the graph must be connected
    //    maxAttempts: maximum number of attempts to generate a connected graph
    let graph: Graph

    do {
      graph = new Graph(isDirected)

      // Add nodes
      for (let i = 0; i < nodeCount; ++i) {
        graph.addNode()
      }

      // Add edges
      for (let i = 0; i < nodeCount; ++i) {
        for (let j = isDirected ? 0 : i; j < nodeCount; ++j) {
          if ((i !== j || allowSelfLoops) && Math.random() < edgeProbability) {
            graph.addEdge(i, j)
          }
        }
      }

      requireConnected &&= !graph.isConnected() && --maxAttempts > 0
    } while (requireConnected)
    if (maxAttempts === 0) { throw new Error('Could not generate a connected graph') }

    return graph
  }

  static generatePath (nodeCount: number, isDirected = false): Graph {
    // Generate a path
    //    nodeCount: number of nodes in the path
    //    isDirected: true if the graph edges are directed
    const graph = new Graph(isDirected)

    graph.addNode()

    // Create nodes and connect each new node to the previous one
    for (let i = 1; i < nodeCount; ++i) {
      graph.addNode()
      graph.addEdge(i - 1, i)
    }

    return graph
  }

  static generateCycle (nodeCount: number, isDirected = false): Graph {
    // Generate a simple cycle
    //    nodeCount: number of nodes in the cycle
    //    isDirected: true if the graph edges are directed

    // Generate a path
    const graph = GraphGenerator.generatePath(nodeCount, isDirected)

    // Connect the last node to the first one
    graph.addEdge(nodeCount - 1, 0)

    return graph
  }

  static generateCompleteGraph (nodeCount: number, isDirected = false, allowSelfLoops = false): Graph {
    // Generate a complete graph
    //    nodeCount: number of nodes in the graph
    //    isDirected: true if the graph edges are directed
    //    allowSelfLoops: true if the graph can contain self-loops (loops from a node to itself)
    const graph = new Graph(isDirected)

    // Add nodes
    for (let i = 0; i < nodeCount; ++i) {
      graph.addNode()
    }

    // Add edges
    for (let i = 0; i < nodeCount; ++i) {
      for (let j = isDirected ? 0 : i; j < nodeCount; ++j) {
        if (i !== j || allowSelfLoops) {
          graph.addEdge(i, j)
        }
      }
    }

    return graph
  }

  static generateArbitraryTree (nodeCount: number, isDirected = false): Graph {
    // Generate an arbitrary tree
    //    nodeCount: number of nodes in the tree
    //    isDirected: true if the graph edges are directed
    const graph = new Graph(isDirected)

    // Add nodes
    for (let i = 0; i < nodeCount; ++i) {
      graph.addNode()
    }

    // Add edges (connect each node to a random node that comes before it)
    for (let i = 1; i < nodeCount; ++i) {
      const randomNode = Math.floor(Math.random() * i)
      graph.addEdge(randomNode, i)
    }

    return graph
  }

  static generateBinaryTree (nodeCount: number, isDirected = false): Graph {
    // Generate a binary tree
    //    nodeCount: number of nodes in the tree
    //    isDirected: true if the graph edges are directed
    const graph = new Graph(isDirected)

    // Add nodes
    for (let i = 0; i < nodeCount; ++i) {
      graph.addNode()
    }

    // Add edges
    for (let i = 1; i < nodeCount; ++i) {
      const parentNode = Math.floor((i - 1) / 2)
      graph.addEdge(parentNode, i)
    }

    return graph
  }
}
