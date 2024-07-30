package trinitarian

// Game State includes												256T-Quad-XLoc-Quad-YLoc- Health - Damage - Speed
// - Array of Enemies => [EnemyType, XY, Health, Damage, Speed]  -> TTTT-XXXX-XXXX-YYYY-YYYY-HHHHHHHH-DDDDDDDD-SSSSSSSS
// - Array of Players => [XY, PlayerHealth, [TowerType, TowerLevel, TowerHealth, TowerDamage (let's make weaker towers weaker), TowerSpeed]] - Each Player Syncs Individually
type GameState struct {
	//Enemies []Enemy
	//Players []Player
}
