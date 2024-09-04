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
                    { 
                        "red": 0,
                        "blue": 0
                    }
                ]
            },
            "2v2": {},
            "3v3": {},
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