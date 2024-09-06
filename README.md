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
      - Double Click Switches to Fixed and Follows Player
         - Zoom In Switches to Third Person 
      [ ] Free Fly Camera Mode has Different Controls
         [X] Middle Click moves the Map
         [ ] Shift + Middle Click Rotates the Camera
   - Add Right Click Menu
   - Create Spawnable Zones
   - NPC Spawn Areas
   - Add MiniMap
      - Add Fast Navigation when Free
   - Add Bases
   - Add Spawners