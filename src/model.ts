/*
model.ts -- Model combining the graph and robot coordinator.
This class handles all aspects of the simulation except for the visualization.

Authors:
  Kyle Walker
*/

import { Graph, GraphGenerator } from './graph'
import * as robot from './robot'

// Custom types
export enum GraphType { Path, Cycle, Complete, ErdosRenyiRandom, ArbitraryTree, BinaryTree }
export enum RobotType { RandomWalkDispersion, RandomWalkExploration, TreeExplorationGlobal, AribitraryGraphExplorationGlobal }

export class Model {
  // Public graph properties
  public graphType: GraphType = GraphType.Path
  public isDirected = false
  public allowSelfLoops = false
  public requireConnected = false

  // Public robot coordinator properties
  public robotCoordinator: robot.RobotCoordinator = {} as robot.RobotCoordinator
  public robotType: RobotType = RobotType.RandomWalkDispersion

  // Private graph properties
  private _graph: Graph = {} as Graph
  private _nodeCount = 0
  private _edgeProbability = 0.5
  private _maxNumberOfGraphGenerationAttempts = 10

  // Private robot coordinator properties
  private _robotCount = 0
  private _robotStartingNode = 0
  private _currentStep = 0
  private _lambda = Infinity // Number of steps between edge shuffling
  private _edgeSurvivalProbability = 1 // Probability that an edge survives shuffling

  generateGraph () {
    // Generate the specified graph type
    switch (this.graphType) {
      case GraphType.ErdosRenyiRandom:
        this._graph = GraphGenerator.generateErdosRenyiRandomGraph(
          this.nodeCount,
          this.edgeProbability,
          this.isDirected,
          this.allowSelfLoops,
          this.requireConnected,
          this.maxNumberOfGraphGenerationAttempts
        )
        break
      case GraphType.Path:
        this._graph = GraphGenerator.generatePath(this.nodeCount, this.isDirected)
        break
      case GraphType.Cycle:
        this._graph = GraphGenerator.generateCycle(this.nodeCount, this.isDirected)
        break
      case GraphType.Complete:
        this._graph = GraphGenerator.generateCompleteGraph(this.nodeCount, this.isDirected, this.allowSelfLoops)
        break
      case GraphType.ArbitraryTree:
        this._graph = GraphGenerator.generateArbitraryTree(this.nodeCount, this.isDirected)
        break
      case GraphType.BinaryTree:
        this._graph = GraphGenerator.generateBinaryTree(this.nodeCount, this.isDirected)
        break
      default:
        throw new Error(`Invalid graph type: ${this.graphType}`)
    }
  }

  generateRobots () {
    // Generate the specified robot type
    switch (this.robotType) {
      case RobotType.RandomWalkDispersion:
        this.robotCoordinator = new robot.RandomWalkDispersionRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
        break
      case RobotType.RandomWalkExploration:
        this.robotCoordinator = new robot.RandomWalkExplorationRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
        break
      case RobotType.TreeExplorationGlobal:
        this.robotCoordinator = new robot.TreeExplorationWithGlobalCommunicationRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
        break
      case RobotType.AribitraryGraphExplorationGlobal:
        this.robotCoordinator = new robot.ArbitraryGraphExplorationWithGlobalCommunicationRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
        break
      default:
        throw new Error(`Invalid robot type: ${this.robotType}`)
    }
  }

  stepRobots () {
    // Step the robots -- move forward one unit of time
    this.robotCoordinator.step()
  }

  runRobots () {
    // Run the robots -- step until an end condition has been met and the simulation is complete
    this.robotCoordinator.run()
  }

  // Getters and setters

  // Graph object (read-only)
  get graph (): Graph { return this._graph }

  // Number of nodes in the graph
  get nodeCount (): number { return this._nodeCount }
  set nodeCount (value: number) {
    if (value < 0) { throw new Error('Node count must be non-negative') }
    this._nodeCount = value
  }

  // Edge probability for random graph generation
  get edgeProbability (): number { return this._edgeProbability }
  set edgeProbability (value: number) {
    if (value < 0 || value > 1) { throw new Error('Edge probability must be in [0, 1]') }
    this._edgeProbability = value
  }

  // Maximum number of attempts to generate a valid random graph
  get maxNumberOfGraphGenerationAttempts (): number { return this._maxNumberOfGraphGenerationAttempts }
  set maxNumberOfGraphGenerationAttempts (value: number) {
    if (value < 1) {
      throw new Error('Max number of graph generation attempts must be positive')
    }
    this._maxNumberOfGraphGenerationAttempts = value
  }

  // List of Robot objects (read-only)
  get robots (): robot.Robot[] { return this.robotCoordinator.robots }

  // List of graph nodes which have been visited by at least one robot (read-only)
  get visitedNodes (): boolean[] { return this.robotCoordinator.visitedNodes }

  // Number of robots at the start of the simulation
  get robotCount (): number { return this._robotCount }
  set robotCount (value: number) {
    if (value < 0) { throw new Error('Robot count must be non-negative') }
    this._robotCount = value
  }

  // Node at which the robots start
  get robotStartingNode (): number { return this._robotStartingNode }
  set robotStartingNode (value: number) {
    if (value < 0 || value >= this.nodeCount) { throw new Error('Starting node must be in [0, nodeCount)') }
    this._robotStartingNode = value
  }

  // Total number of time steps in the simulation (read-only)
  get stepCount (): number { return this.robotCoordinator.stepNumber }

  // Current time step in the simulation
  get currentStep (): number { return this._currentStep }
  set currentStep (value: number) {
    if (value < 0 || value >= this.stepCount) { throw new Error('Current step must be in [0, stepCount)') }
    this._currentStep = value
  }

  // Number of steps between edge shuffling
  get lambda (): number { return this._lambda }
  set lambda (value: number) {
    if (!((value > 0 && Number.isInteger(value)) || value === Infinity)) { throw new Error('Lambda must be a positive integer or Infinity') }
    this._lambda = value
  }

  // Probability that an edge survives shuffling
  get edgeSurvivalProbability (): number { return this._edgeSurvivalProbability }
  set edgeSurvivalProbability (value: number) {
    if (value < 0 || value > 1) { throw new Error('Edge survival probability must be in [0, 1]') }
    this._edgeSurvivalProbability = value
  }

  // List of numbers representing how many robots are on each node (read-only)
  get numberOfRobotsOnEachNode (): number[] {
    // Index of this list is the node ID
    const numberOfRobotsOnEachNode = new Array(this.nodeCount).fill(0)
    this.robots.forEach((robot) => {
      numberOfRobotsOnEachNode[robot.currentNode]++
    })
    return numberOfRobotsOnEachNode
  }
}
