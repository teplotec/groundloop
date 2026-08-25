import pygfunction as gt


def test_pygfunction_reference_engine_can_build_a_borehole() -> None:
    borehole = gt.boreholes.Borehole(
        H=61.0,
        D=1.0,
        r_b=0.075,
        x=0.0,
        y=0.0,
    )

    assert borehole.H == 61.0
    assert borehole.r_b == 0.075
