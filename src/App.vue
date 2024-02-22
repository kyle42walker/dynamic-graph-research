<script setup lang="ts">
/*
App.vue -- Vue 3 application for visualizing robot exploration of a graph

Authors:
  Kyle Walker
*/
import * as vNG from 'v-network-graph'
import {
  ForceLayout,
  ForceNodeDatum,
  ForceEdgeDatum
} from 'v-network-graph/lib/force-layout'
import { Model, GraphType, RobotType } from './model'
import { VisualGraph, LayoutType } from './visual_graph'
import { Robot } from './robot'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import RobotSelector from './components/RobotSelector.vue'
import { provide, ref, shallowRef, triggerRef } from 'vue'

// Will get model properties from GUI
const model = new Model()

// Graph
model.graphType = GraphType.ErdosRenyiRandom
model.nodeCount = 31
model.edgeProbability = 0.1
model.isDirected = false
model.allowSelfLoops = false
model.requireConnected = true
model.maxNumberOfGraphGenerationAttempts = 10
model.generateGraph()

// Visual graph
const nodeColorScheme: 'robotCount' | 'uniform' = 'robotCount'
const indcateVisitedNodes = true
const layoutType = LayoutType.ForceDirected
const showGraph = true
const nodeLabelsAreVisible = true
const portLabelsAreVisible = true
const graphWidth = 1000
const graphHeight = 700
const vng = new VisualGraph(model.graph, graphWidth, graphHeight, layoutType)
const nodes = ref(vng.nodes)
const edges = ref(vng.edges)
const layouts = ref(vng.layouts)

// Force directed layout
const fdEdgeDistance = 40
const fdEdgeStrength = 0.6
const fdChargeStrength = -800
const fdCenterStrength = 0.99
const fdAlphaMin = 0.001

// Robots
model.robotType = RobotType.AribitraryGraphExplorationGlobal
model.robotCount = 10
model.robotStartingNode = 0
model.lambda = 5
model.edgeSurvivalProbability = 0.5
model.generateRobots()

// Grant access to robots in all modules
const robots = shallowRef<Robot[]>(model.robots)
provide('robots', robots)

// Iterate through all nodes and set color
colorNodes()

// Iterate through all edges and set color
colorEdges()

const configs = vNG.defineConfigs({
  node: {
    normal: { type: 'circle', radius: 20, color: node => node.color, strokeColor: node => node.strokeColor, strokeWidth: 3 },
    hover: { color: '#88bbff' },
    label: { visible: nodeLabelsAreVisible, fontSize: 8, text: node => node.name as string }
  },
  edge: {
    gap: 12,
    normal: { color: edge => edge.color },
    marker: { target: { type: 'none' as 'none' | 'arrow' | 'angle' | 'circle' | 'custom' } }
  },
  path: {
    visible: true,
    normal: {
      color: path => path.test ? '#6699cc' : '#000000',
      width: 10,
      dasharray: '10 16',
      animate: true,
      animationSpeed: path => path.test ? -40 : 40
    }
  }
})
if (layoutType.valueOf() === LayoutType.ForceDirected) {
  configs.view = {
    layoutHandler: new ForceLayout({
      positionFixedByDrag: false,
      positionFixedByClickWithAltKey: true,
      createSimulation: (d3, nodes, edges) => {
        // d3-force parameters
        const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d: { id: string }) => d.id)
        return d3
          .forceSimulation(nodes)
          .force('edge', forceLink.distance(fdEdgeDistance).strength(fdEdgeStrength))
          .force('charge', d3.forceManyBody().strength(fdChargeStrength))
          .force('center', d3.forceCenter(graphWidth / 2, graphHeight / 2).strength(fdCenterStrength))
          .alphaMin(fdAlphaMin)
      }
    })
  }
}
if (model.isDirected) { configs.edge.marker.target.type = 'arrow' }

// Initialize selected robot
const paths = ref({})
const selectedRobot = ref<Robot | null>(null)
provide('selectedRobot', selectedRobot)

// Handle new robot selection
function onRobotSelected (robot: Robot | null) {
  // Reset node colors
  colorNodes()

  // Remove path if no robot is selected
  if (robot === null) {
    paths.value = {}
    return
  }

  // Update path for new robot position
  paths.value = VisualGraph.getPath(robot, model.graph)

  // Mark current node
  nodes.value[robot.currentNode.toString()].color = '#0000FF'
}

function stepRobots () {
  // Step the robots
  model.stepRobots()

  // Update the selected robot path
  onRobotSelected(selectedRobot.value)

  // Update removed edges
  colorEdges()

  // Update robots list to trigger reactivity
  triggerRef(robots)

  Object.keys(edges.value).forEach(key => {
    edges.value[key].color = edges.value[key].weight > 0 ? '#000000' : '#FF0000'
  })
}

function colorNodes () {
  // Color the nodes based on the selected nodeColorScheme
  switch (nodeColorScheme) {
    // Color all nodes with a gradient based on the number of robots on each node
    case 'robotCount':
      model.numberOfRobotsOnEachNode.forEach((robotNumber, nodeId) => {
        const node = nodes.value[nodeId.toString()]
        if (node === undefined) { return }
        const color = robotNumber === 0 ? '#99ccff' : `hsl(0, 100%, ${100 - robotNumber * 10}%)`
        node.color = color
      })
      break

    // Color all nodes the same color
    case 'uniform':
      Object.keys(nodes.value).forEach(key => {
        nodes.value[key].color = '#99ccff'
      })
      break
  }

  // Color the outlines of visited nodes
  if (indcateVisitedNodes) {
    model.visitedNodes.forEach((visited, nodeId) => {
      if (visited) {
        nodes.value[nodeId.toString()].strokeColor = '#32CD32'
      }
    })
  }
}

function colorEdges () {
  // Color the edges based on their weight (red for removed, black for present)
  vng.updateEdgeWeights(model.graph.nodes)
  Object.keys(edges.value).forEach(key => {
    edges.value[key].color = edges.value[key].weight > 0 ? '#000000' : '#FF0000'
  })
}
</script>

<template>
  <v-network-graph v-if="showGraph" class=graph :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"
    :paths="paths" :style="{ width: graphWidth + 'px', height: graphHeight + 'px' }">
    <template #edge-label="{ edge, ...slotProps}">
      <v-edge-label v-if="portLabelsAreVisible" :text="`${edge.sourcePort}`" align="source" vertical-align="above"
        v-bind="slotProps" />
      <v-edge-label v-if="portLabelsAreVisible" :text="`${edge.targetPort}`" align="target" vertical-align="above"
        v-bind="slotProps" />
    </template>
  </v-network-graph>
  <Slider v-model="model.currentStep" :min="0" :max="model.stepCount" />
  <Button label="Step" @click="stepRobots()" />
  <RobotSelector @robot-selected="onRobotSelected" :selectedRobot="selectedRobot" />
</template>

<style>
.blue {
  color: #88bbff;
}

.red {
  color: #ff0000;
}

.graph {
  border: 1px solid #000;
}
</style>
