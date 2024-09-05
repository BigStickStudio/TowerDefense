const game_modes = {
    "pvp": {
        "battle": {
            "1v1": {
                "red": [
                    {
                        "min_x": 0,
                        "max_x": 1,
                        "min_y": 0,
                        "max_y": 0
                    }
                ],
                "blue": [
                    {
                        "min_x": 0,
                        "max_x": 1,
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
            },
            "2v2": {
                "red": [
                    {
                        "min_x": 0,
                        "max_x": 0.5,
                        "min_y": 0,
                        "max_y": 0
                    },
                    {
                        "min_x": 0.5,
                        "max_x": 1,
                        "min_y": 0,
                        "max_y": 0
                    }
                ],
                "blue": [
                    {
                        "min_x": 0,
                        "max_x": 0.5,
                        "min_y": 1,
                        "max_y": 1
                    },
                    {
                        "min_x": 0.5,
                        "max_x": 1,
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
            "3v3": {
                "red": [
                    {
                        "min_x": 0,
                        "max_x": 0.5,
                        "min_y": 0,
                        "max_y": 0
                    },
                    {
                        "min_x": 0.5,
                        "max_x": 1,
                        "min_y": 0,
                        "max_y": 0
                    },
                    {
                        "min_x": 0.5,
                        "max_x": 0.6,
                        "min_y": 0.3,
                        "max_y": 0.4
                    }
                ],
                "blue": [
                    {
                        "min_x": 0,
                        "max_x": 0.5,
                        "min_y": 1,
                        "max_y": 1
                    },
                    {
                        "min_x": 0.5,
                        "max_x": 1,
                        "min_y": 1,
                        "max_y": 1
                    },
                    {
                        "min_x": 0.3,
                        "max_x": 0.6,
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
            "5v5": {},
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