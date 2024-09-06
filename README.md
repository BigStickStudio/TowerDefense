# TowerDefense
Our Client uses Python + ThreeJS
Our Server uses Golang

## TODO:
   [X] Ability to Toggle between 3rd Person and Top Down 
      [X] Scrolling Out Zooms to Top Down
   [X] Map SkyBox to Sphere (SkySphere)
   [ ] Dynamic Map Generation
      [X] Generate Spawnable Areas
      [X] 'Floor'
         - Add 'Weight Map' for NPC Path Finding
      [ ] Create Walls and Top-Level Terrain
      [ ] Interpolate between heightmap for coloring
      [ ] Generate Paths
         [X] Path and Node Generation Working
         - Remove Crossover Sections that allow bots to skip areas
      [ ] Single vs Multiplayer Map Generation
         [X] Map ConfigMap
               [ ] (PvP) Battle Royal - 1v1, 2v2, 3v3, 5v5, 7v7
               - (PvP) Invasion - 1v2, 2v3, 3v5, 5v7
               - (PvC) Defense - 1v1, 1v2, 2v2, 2v4, 3v3, 3v5, 5v5, 5v7 
   - Select Spawnable (Floor)
   - Fix GTLF Animation
   [ ] Ability to Toggle between Free Form Camera and Player Mounted Camera 
      - Switch to Fixed Mode
         - Locks to a Character if we Double Click the Character
         - Locks to a Spawn Area if we Double Click a Region from Free Form
      [X] Free Fly Camera Mode has Different Controls
         [X] Shift + Middle Click moves the Map
         [X] Middle Click Rotates the Camera
   - Add Right Click Menu
   - Create Spawnable Zones
   - NPC Spawn Areas
   - Add MiniMap
      - Add Fast Navigation when Free
   - Add Bases
   - Add Spawners