# TowerDefense
Our Client uses Python + ThreeJS
Our Server uses Golang

## Run
To run the application:
 - clone the repo
 - cd into `client`
 - run the application using `python pyserve.py`
 - open the browser and navigate to `localhost:9001`

## Controls

|     Button           |    Control                                  |
|----------------------|---------------------------------------------|
| Left Click           | Spawns a tower at a player square           |
| Middle Mouse         | changes the lookat point of the camera      |
| Shift + Middle Mouse | changes the location of the camera          |
| Scroll Wheel         | Zooms in and Out                            |

Additional Notes: 
- To zoom in to `third-person`/`first-person` mode requires having a target selected
- To select a target requires opening the menu in the top right and switching to `Fixed` camera mode
- Spawning towers only works when in free mode
- Moving the Camera while in `top-down` switches to `Free Fly` camera mode


## Known Bugs:
 - Opening the link from the terminal when running `pyserve` sometimes fails to load threejs
 - Camera Flips Upside Down when switching from Fixed to Free Camera
 - Shadow comes through the back of the map


## Fixed Bugs:
 - Day and Night Cycles just Jump when they hit 0
 - Low FPS when moving targets quickly (or when using multiple instance meshes)
 - Paths Overlap


## TODO:

#### Legend:
```
 - [X] Completed
 - [ ] In Progress
 - Not Yet
```
   - [X] Ability to Toggle between 3rd Person and Top Down 
      - [X] Scrolling Out Zooms to Top Down
   - [X] Map SkyBox to Sphere (SkySphere)
   - [ ] Ability to Toggle between Free Form Camera and Player Mounted Camera 
      - Switch to Fixed Mode
         - Locks to a Character if we Double Click the Character
         - Unlocks if the Character is already selected
         - Locks to a Spawn Area if we Double Click a Region from Free Form
      - [X] Free Fly Camera Mode has Different Controls
         - [X] Shift + Middle Click moves the Map
         - [X] Middle Click Rotates the Camera
   - [ ] Dynamic Map Generation
      - [X] Generate Spawnable Areas
      - [#] 'Floor'
         - [X] Fix XY Offset to 0 and translate by 1/2 map
         - [X] Connect Spawnable Areas using Configs
         - [X] Generate Paths
            - [X] Path and Node Generation Working
            - Remove Crossover Sections that allow bots to skip areas
         - Add 'Weight Map' for NPC Path Finding
         - [X] Generate Square_Table Grid for Optimized Map Generation and Inline Deduplication
      - [ ] Create Walls and Top-Level Terrain
         - [X] Generate Mesh for Map based on Square_Table
         - [ ] Interpolate between heightmap for coloring
      - [ ] Single vs Multiplayer Map Generation
         - [X] Map ConfigMap
               - [ ] (PvP) Battle Royal - 1v1, 2v2, 3v3, 4v4, 5v5, 7v7
               - (PvP) Invasion - 1v2, 2v3, 3v5, 5v7
               - (PvC) Defense - 1v1, 1v2, 2v2, 2v4, 3v3, 3v5, 5v5, 5v7 
   - Select Spawnable (Floor)
   - Add Selection Area
   - Fix GTLF Animation
   - Add Right Click Menu
   - Create Spawnable Zones
   - NPC Spawn Areas
   - NPC Pathfinding Logic
      - Individuals
      - Horde
   - Add MiniMap
      - Add Fast Navigation when Free
   - Add Bases
   - Add Spawners
   - Add Menu
      - Add Lobby

   - Marketplace
      - Mint Towers and Troop Sets
      - 

   - Gameplay Features
      - Select Area
      - Build and Destroy Towers
         - Towers can Take Damage
         - Upgrade Towers
      - Deploy Troops
         - Upgrade Offensive Troops
         - Direct Troops
      - Gain Levels
         - Skill Tree
            - Tower/Troop Sets
            - Periodic Power Ups
            - Persistent Stacks
      - Mint, Trade and Lease Towers
         - Tower Sets can Accrue actuation for usage
         - Exchange Player Cards, Towers and Troops

   - Add Multiplayer 
      - Add User Database Integrations
      - Add Match Making
      - Add Reward / Ranking
      - Add 'Guilds' and 'Factions'
         - Guilds are like Clans of People all sharing rewards and resources
            - Guilds can be a part of a Bracket where they have to face off
         - Factions are formed naturally as players form alliances by playing on the same team
            - Factions allow for 'preferred build-outs'
      - Various spawn modes
         - Automatic Waves i.e. Both teams defend against timed spawns
         - Manual Waves
            - Individuals can send hordes when they are ready
            - Entire Teams have to send together
