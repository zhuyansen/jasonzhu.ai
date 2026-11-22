"""Unit tests for ops/analytics/watch_health.py hysteresis & alert formatting."""
import watch_health


def _chk(cid, ok, detail=""):
    return {
        "id": cid,
        "label": cid,
        "target": "https://example.com",
        "ok": ok,
        "latency_ms": 100 if ok else None,
        "status_text": "HTTP 200 (100ms)" if ok else "HTTP 503",
        "detail": detail,
    }


def test_hysteresis_alerts_on_second_failure_and_recovers_once():
    # 1st failure: below threshold -> no alert
    st1, alerts1, rec1 = watch_health.evaluate_transitions([_chk("a", False, "503")], {}, threshold=2)
    assert alerts1 == []
    assert rec1 == []
    assert st1["a"]["failures"] == 1
    assert st1["a"]["alerted"] is False

    # 2nd consecutive failure: hits threshold -> single alert
    st2, alerts2, rec2 = watch_health.evaluate_transitions([_chk("a", False, "503")], st1, threshold=2)
    assert len(alerts2) == 1
    assert alerts2[0]["failures"] == 2
    assert rec2 == []
    assert st2["a"]["alerted"] is True

    # 3rd failure while already alerted: no duplicate alert spam
    st3, alerts3, rec3 = watch_health.evaluate_transitions([_chk("a", False, "503")], st2, threshold=2)
    assert alerts3 == []
    assert rec3 == []
    assert st3["a"]["failures"] == 3
    assert st3["a"]["alerted"] is True

    # Recovery: emits recovery notification once and resets state
    st4, alerts4, rec4 = watch_health.evaluate_transitions([_chk("a", True)], st3, threshold=2)
    assert alerts4 == []
    assert len(rec4) == 1
    assert rec4[0]["prev_failures"] == 3
    assert st4["a"]["failures"] == 0
    assert st4["a"]["alerted"] is False


def test_single_blip_resets_cleanly():
    st1, alerts1, _ = watch_health.evaluate_transitions([_chk("b", False, "timeout")], {}, threshold=2)
    assert alerts1 == []
    st2, alerts2, rec2 = watch_health.evaluate_transitions([_chk("b", True)], st1, threshold=2)
    assert alerts2 == []
    assert rec2 == []
    assert st2["b"]["failures"] == 0
    assert st2["b"]["alerted"] is False


def test_build_email_formats_alert_and_recovery():
    checks = [_chk("site:jasonzhu-home", True), _chk("channel:AIsa", False, "余额不足")]
    subject, body = watch_health.build_email(
        [{**checks[1], "failures": 2}],
        [],
        checks,
        "11-22 11:50",
    )
    assert "故障告警 1 项" in subject
    assert "连续失败 2 次" in body
    assert "余额不足" in body
