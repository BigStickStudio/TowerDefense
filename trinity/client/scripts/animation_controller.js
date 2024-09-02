const prepareCrossFade = (start, end, duration) => {
    if (this.set_state === 'Resting' || !start || !end) {
        this.crossFade(start, end, duration);
    } else {
        this.syncCrossfade(start, end, duration);
    }

    if (end) {
        this.setState(end);
    } else {
        this.setState(start);
    }
}

export const settings = {
    "walk_to_idle": null,
    "idle_to_walk": null,
    "walk_to_run": null,
    "run_to_walk": null,
    "run_to_jump": null,
    "jump_to_run": null,
    "walk_to_jump": null,
    "jump_to_walk": null,
    "reverse_to_idle": null,
    "idle_to_reverse": null,
    "reverse_to_walk": null,
    "reverse_to_jump": null,
    "jump_to_reverse": null,
    "idle_weight": 0.0,
    "walk_weight": 1.0,
    "run_weight": 0.0
}