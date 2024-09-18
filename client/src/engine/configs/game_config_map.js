const game_modes = {
    "pvp": {
        "battle": {
            "1v1": {
                "config_count": 1,
                "configuration": [
                        {
                            "grid_size": {
                                "x": 40,
                                "y": 50
                            },
                            "red": [
                                    {
                                        "min_x": 0.3,
                                        "max_x": 0.7,
                                        "min_y": 0,
                                        "max_y": 0
                                    }
                                ],
                            "blue": [
                                {
                                    "min_x": 0.3,
                                    "max_x": 0.7,
                                    "min_y": 1,
                                    "max_y": 1
                                }
                            ],
                            "paths": [
                                [ 
                                    { "red": 0 },
                                    { "blue": 0 }
                                ]
                            ]
                        }
                    ]
            },
            "2v2": {
                "config_count": 2,
                "configuration": [
                    {
                        "grid_size": {
                            "x": 60,
                            "y": 80
                        },
                        "red": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.35,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.65,
                                "max_x": 0.8,
                                "min_y": 0,
                                "max_y": 0
                            }
                        ],
                        "blue": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.35,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.65,
                                "max_x": 0.8,
                                "min_y": 1,
                                "max_y": 1
                            }
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "blue": 0 }
                            ],
                            [ 
                                { "red": 1 },
                                { "blue": 1 }
                            ]
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 50,
                            "y": 120
                        },
                        "red": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.8,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.8,
                                "min_y": 0.25,
                                "max_y": 0.4
                            }
                        ],
                        "blue": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.8,
                                "min_y": 0.6,
                                "max_y": 0.75
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.8,
                                "min_y": 1,
                                "max_y": 1
                            }
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 1 }
                            ],
                            [
                                { "red": 1 },
                                { "blue": 0 }
                            ],
                            [ 
                                { "blue": 0 },
                                { "blue": 1 }
                            ]
                        ]
                    }
                    
                ]
            },
            "3v3": {
                "config_count": 3,
                "configuration": [
                    {
                        "grid_size": {
                            "x": 90,
                            "y": 60
                        },
                        "red": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.2,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.425,
                                "max_x": 0.575,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.75,
                                "max_x": 0.875,
                                "min_y": 0.0,
                                "max_y": 0.0
                            }
                        ],
                        "blue": [
                            {
                                "min_x": 0.125,
                                "max_x": 0.275,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.425,
                                "max_x": 0.575,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.725,
                                "max_x": 0.875,
                                "min_y": 1,
                                "max_y": 1
                            }
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "blue": 0 },
                            ],
                            [
                                { "red": 1 },
                                { "blue": 1 }
                            ],
                            [ 
                                { "red": 2 },
                                { "blue": 2 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 80,
                            "y": 100
                        },
                        "red": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.3,
                                "max_x": 0.7,
                                "min_y": 0.3,
                                "max_y": 0.4
                            }
                        ],
                        "blue": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.3,
                                "max_x": 0.7,
                                "min_y": 0.6,
                                "max_y": 0.7
                            }
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 2 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 2 }
                            ],
                            [ 
                                { "red": 2 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "blue": 2 },
                                { "blue": 0 }
                            ],
                            [ 
                                { "blue": 2 },
                                { "blue": 1 }
                            ]
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 80,
                            "y": 100
                        },
                        "red": [
                            {
                                "min_x": 0.3,
                                "max_x": 0.7,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                            {
                                "min_x": 0.3,
                                "max_x": 0.7,
                                "min_y": 1,
                                "max_y": 1
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 1 },
                            ],
                            [
                                { "red": 0 },
                                { "red": 2 }
                            ],
                            [ 
                                { "red": 1 },
                                { "blue": 0 }
                            ],
                            [ 
                                { "red": 2 },
                                { "blue": 1 }
                            ],
                            [ 
                                { "blue": 0 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "blue": 1 },
                                { "blue": 2 }
                            ]
                        ]
                    }
                ]
            },
            "5v5": {
                "config_count": 8,
                "configuration": [
                    {
                        "grid_size": {
                            "x": 160,
                            "y": 160
                        },
                        "red": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.3,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.7,
                                "max_x": 0.9,
                                "min_y": 0,
                                "max_y": 0
                            },
                            
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.3,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.7,
                                "max_x": 0.9,
                                "min_y": 1,
                                "max_y": 1
                            },
                            
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 3 }
                            ],
                            [ 
                                { "red": 2 },
                                { "red": 4 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 2 },
                                { "red": 4 }
                            ],
                            [ 
                                { "red": 3 },
                                { "blue": 3 }
                            ],
                            [ 
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 3 },
                                { "blue": 0 },
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 1 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 1 },
                            ],
                            [
                                { "blue": 4 },
                                { "blue": 2 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 160,
                            "y": 160
                        },
                        "red": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.1,
                                "max_x": 0.3,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                            {
                                "min_x": 0.7,
                                "max_x": 0.9,
                                "min_y": 0.3,
                                "max_y": 0.4
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.1,
                                "max_x": 0.3,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                            {
                                "min_x": 0.7,
                                "max_x": 0.9,
                                "min_y": 0.6,
                                "max_y": 0.7
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 2 },
                            ],
                            [
                                { "red": 0 },
                                { "red": 3 }
                            ],
                            [ 
                                { "red": 1 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 2 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "red": 3 },
                                { "blue": 3 }
                            ],
                            [ 
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 2 },
                                { "blue": 0 },
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 0 }
                            ],
                            [ 
                                { "blue": 3 },
                                { "blue": 1 },
                            ],
                            [
                                { "blue": 4 },
                                { "blue": 1 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 120,
                            "y": 180
                        },
                        "red": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.2,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.2,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.7,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.7,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 2 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 3 }
                            ],
                            [ 
                                { "red": 2 },
                                { "red": 4 },
                            ],
                            [
                                { "red": 3 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 3 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "blue": 2 },
                                { "blue": 0 },
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 1 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 120,
                            "y": 180
                        },
                        "red": [
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.2,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.2,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.7,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.7,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.2,
                                "max_x": 0.4,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                            {
                                "min_x": 0.6,
                                "max_x": 0.8,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 1 },
                            ],
                            [
                                { "red": 0 },
                                { "red": 2 }
                            ],
                            [ 
                                { "red": 1 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 2 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 3 },
                                { "blue": 3 }
                            ],
                            [ 
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "blue": 3 },
                                { "blue": 1 },
                            ],
                            [
                                { "blue": 2 },
                                { "blue": 0 }
                            ],
                            [
                                { "blue": 1 },
                                { "blue": 0 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 120,
                            "y": 180
                        },
                        "red": [
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.2,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.1,
                                "max_x": 0.25,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                            {
                                "min_x": 0.75,
                                "max_x": 0.9,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                        ],
                        "blue": [
                            
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.7,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.1,
                                "max_x": 0.25,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                            {
                                "min_x": 0.75,
                                "max_x": 0.9,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 1 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 2 }
                            ],
                            [ 
                                { "red": 1 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 2 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "red": 3 },
                                { "blue": 3 }
                            ],
                            [ 
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 1 },
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 1 }
                            ],
                            [
                                { "blue": 2 },
                                { "blue": 1 }
                            ],
                            [
                                { "blue": 1 },
                                { "blue": 0 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 150,
                            "y": 200
                        },
                        "red": [
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.45,
                                "max_x": 0.55,
                                "min_y": 0.25,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.1,
                                "max_x": 0.2,
                                "min_y": 0.25,
                                "max_y": 0.4
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                            {
                                "min_x": 0.8,
                                "max_x": 0.9,
                                "min_y": 0.25,
                                "max_y": 0.4
                            },
                        ],
                        "blue": [
                            
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.7,
                                "max_y": 0.75
                            },
                            {
                                "min_x": 0.1,
                                "max_x": 0.2,
                                "min_y": 0.6,
                                "max_y": 0.75
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                            {
                                "min_x": 0.8,
                                "max_x": 0.9,
                                "min_y": 0.6,
                                "max_y": 0.75
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 1 },
                            ],
                            [
                                { "red": 0 },
                                { "red": 2 }
                            ],
                            [ 
                                { "red": 1 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 0 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 2 },
                                { "blue": 2 }
                            ],
                            [ 
                                { "red": 3 },
                                { "blue": 3 }
                            ],
                            [ 
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 0 },
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 1 }
                            ],
                            [
                                { "blue": 2 },
                                { "blue": 0 }
                            ],
                            [
                                { "blue": 1 },
                                { "blue": 0 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 180,
                            "y": 200
                        },
                        "red": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.3,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.7,
                                "max_x": 0.9,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.45,
                                "max_x": 0.55,
                                "min_y": 0.2,
                                "max_y": 0.3
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.3,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.7,
                                "max_x": 0.9,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.7,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 3 }
                            ],
                            [ 
                                { "red": 2 },
                                { "red": 3 },
                            ],
                            [
                                { "red": 3 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 3 },
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 0 }
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 1 }
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 2 }
                            ],
                        ]
                    },
                    {
                        "grid_size": {
                            "x": 180,
                            "y": 200
                        },
                        "red": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.25,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 0.0,
                                "max_y": 0.0
                            },
                            {
                                "min_x": 0.75,
                                "max_x": 0.9,
                                "min_y": 0,
                                "max_y": 0
                            },
                            {
                                "min_x": 0.45,
                                "max_x": 0.55,
                                "min_y": 0.2,
                                "max_y": 0.25
                            },
                            {
                                "min_x": 0.45,
                                "max_x": 0.55,
                                "min_y": 0.4,
                                "max_y": 0.45
                            },
                        ],
                        "blue": [
                            {
                                "min_x": 0.1,
                                "max_x": 0.25,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.4,
                                "max_x": 0.6,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.75,
                                "max_x": 0.9,
                                "min_y": 1,
                                "max_y": 1
                            },
                            {
                                "min_x": 0.45,
                                "max_x": 0.55,
                                "min_y": 0.75,
                                "max_y": 0.8
                            },
                            {
                                "min_x": 0.45,
                                "max_x": 0.55,
                                "min_y": 0.55,
                                "max_y": 0.6
                            },
                        ],
                        "paths": [
                            [ 
                                { "red": 0 },
                                { "red": 4 },
                            ],
                            [
                                { "red": 1 },
                                { "red": 3 }
                            ],
                            [ 
                                { "red": 2 },
                                { "red": 4 },
                            ],
                            [
                                { "red": 3 },
                                { "red": 4 }
                            ],
                            [
                                { "red": 4 },
                                { "blue": 4 }
                            ],
                            [ 
                                { "blue": 4 },
                                { "blue": 3 },
                            ],
                            [
                                { "blue": 4 },
                                { "blue": 0 }
                            ],
                            [
                                { "blue": 3 },
                                { "blue": 1 }
                            ],
                            [
                                { "blue": 4 },
                                { "blue": 2 }
                            ],
                        ]
                    }
                ]
            },
            "7v7": {}
        },
        "invasion": {
            "1v2": {
                "defense": [
                    {
                        "min_x": 0,
                        "max_x": 1,
                        "min_y": 1,
                        "max_y": 1
                    }
                ],
                "horde": [
                    {
                        "min_x": 0,
                        "max_x": 0.5,
                        "min_y": 0,
                        "max_y": 0
                    },
                    {
                        "min_x": 0,
                        "max_x": 0.5,
                        "min_y": 0,
                        "max_y": 0
                    }
                ]
            },
            "2v3": {},
            "3v5": {},
            "5v7": {},
        },
    },
    "bot": {
        "1v1": {},
        "1v2": {},
        "1v3": {},
        "2v2": {},
        "2v4": {},
        "3v3": {},
        "3v5": {},
        "5v5": {},
        "5v7": {}
    },
}

export default game_modes;