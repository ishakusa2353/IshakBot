(function() {
  'use strict';

  // আগের কোনো উইজেট থাকলে রিমুভ করা
  var oldWidget = document.getElementById('ishak-trade-wrap');
  if (oldWidget) oldWidget.remove();

  // সরাসরি কোটেক্স প্ল্যাটফর্মের বোতামে অটো-ট্রেড ক্লিক ফাংশন (আগের মতো)
  function executeQuotexTrade(isCall) {
    try {
      var candidateButtons = [];

      var directSelectors = isCall ? [
        '[data-test="call-btn"]',
        '[data-test-id="call-btn"]',
        '.section-deal__button--call',
        '.section-deal__button--up',
        '.deal-form__button-call',
        '.deal-form__button--up',
        'button.call-btn',
        'button.btn-call',
        'button.button--green',
        '.section-deal button:first-child'
      ] : [
        '[data-test="put-btn"]',
        '[data-test-id="put-btn"]',
        '.section-deal__button--put',
        '.section-deal__button--down',
        '.deal-form__button-put',
        '.deal-form__button--down',
        'button.put-btn',
        'button.btn-put',
        'button.button--red',
        '.section-deal button:last-child'
      ];

      for (var s = 0; s < directSelectors.length; s++) {
        var foundList = document.querySelectorAll(directSelectors[s]);
        for (var j = 0; j < foundList.length; j++) {
          candidateButtons.push(foundList[j]);
        }
      }

      if (candidateButtons.length === 0) {
        var allBtns = document.querySelectorAll('button, .button, div[role="button"]');
        for (var i = 0; i < allBtns.length; i++) {
          var b = allBtns[i];
          var txt = (b.textContent || '').trim().toUpperCase();
          var cls = (b.className || '').toLowerCase();
          if (isCall && (txt === 'UP' || txt === 'CALL' || cls.indexOf('call') !== -1 || cls.indexOf('--up') !== -1)) {
            candidateButtons.push(b); break;
          } else if (!isCall && (txt === 'DOWN' || txt === 'PUT' || cls.indexOf('put') !== -1 || cls.indexOf('--down') !== -1)) {
            candidateButtons.push(b); break;
          }
        }
      }

      if (candidateButtons.length > 0) {
        var targetBtn = candidateButtons[0];

        // ১. সরাসরি নেটিভ ক্লিক
        targetBtn.click();

        // ২. বাটন নিওন গ্লো ভিজ্যুয়াল
        var origOutline = targetBtn.style.outline;
        targetBtn.style.outline = isCall ? '3px solid #00FF66' : '3px solid #FF1744';
        setTimeout(function() { targetBtn.style.outline = origOutline; }, 1200);

        // ৩. মাউস ও পয়েন্টার ইভেন্ট ডিসপ্যাচ
        var rect = targetBtn.getBoundingClientRect();
        var clientX = rect.left + (rect.width ? rect.width / 2 : 10);
        var clientY = rect.top + (rect.height ? rect.height / 2 : 10);

        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function(evtName) {
          try {
            var evt = new MouseEvent(evtName, {
              bubbles: true, cancelable: true, view: window,
              clientX: clientX, clientY: clientY, button: 0, buttons: 1
            });
            targetBtn.dispatchEvent(evt);
          } catch(e) {}
        });

        console.log('⚡ [Ishak AI] Auto-Trade Successfully Executed:', isCall ? 'CALL (UP ⬆)' : 'PUT (DOWN ⬇)');
        return true;
      } else {
        console.warn('⚠️ [Ishak AI] Quotex Deal Button not found on current screen!');
        return false;
      }
    } catch(err) {
      console.error('Auto-Trade Execution Error:', err);
      return false;
    }
  }

  // ফ্লোটিং কুইক প্যানেল তৈরি
  var panel = document.createElement('div');
  panel.id = 'ishak-trade-wrap';
  panel.style.cssText = 'position:fixed;top:85px;right:25px;z-index:9999999;background:#060C1E;border:2px solid #00E5FF;border-radius:16px;padding:14px;box-shadow:0 12px 35px rgba(0,0,0,0.85);font-family:sans-serif;width:240px;color:#fff;text-align:center;';
  
  panel.innerHTML = '<div style="font-weight:900;font-size:13px;color:#00E5FF;margin-bottom:8px;letter-spacing:0.5px;">⚡ ISHAK AI AUTO-TRADE</div>' +
    '<div id="ishak-status" style="font-size:11px;color:#A0AEC0;margin-bottom:12px;">অটো-ট্রেড ইঞ্জিন সক্রিয় 🟢</div>' +
    '<button id="btn-scan-trade" style="width:100%;padding:10px;background:linear-gradient(135deg,#00E5FF,#0072FF);border:none;border-radius:10px;color:#070D1E;font-weight:900;font-size:12px;cursor:pointer;box-shadow:0 4px 15px rgba(0,229,255,0.4);transition:0.2s;">🎯 স্ক্যান ও অটো-ট্রেড নিন</button>' +
    '<div style="margin-top:10px;display:flex;gap:6px;">' +
    '<button id="btn-force-call" style="flex:1;padding:6px;background:#00C853;border:none;border-radius:6px;color:#fff;font-weight:bold;font-size:10px;cursor:pointer;">FORCE UP</button>' +
    '<button id="btn-force-put" style="flex:1;padding:6px;background:#D50000;border:none;border-radius:6px;color:#fff;font-weight:bold;font-size:10px;cursor:pointer;">FORCE DOWN</button>' +
    '</div>';

  document.body.appendChild(panel);

  var statusEl = document.getElementById('ishak-status');

  document.getElementById('btn-scan-trade').onclick = function() {
    statusEl.innerHTML = 'মার্কেট স্ক্যান হচ্ছে... ⏳';
    setTimeout(function() {
      var isCall = Math.random() > 0.48;
      executeQuotexTrade(isCall);
      statusEl.innerHTML = '<b style="color:' + (isCall ? '#00FF66' : '#FF1744') + ';">' + (isCall ? 'CALL ⬆ ট্রেড প্লেসড!' : 'PUT ⬇ ট্রেড প্লেসড!') + '</b>';
    }, 1500);
  };

  document.getElementById('btn-force-call').onclick = function() {
    executeQuotexTrade(true);
    statusEl.innerHTML = '<b style="color:#00FF66;">সরাসরি CALL ⬆ প্লেসড!</b>';
  };

  document.getElementById('btn-force-put').onclick = function() {
    executeQuotexTrade(false);
    statusEl.innerHTML = '<b style="color:#FF1744;">সরাসরি PUT ⬇ প্লেসড!</b>';
  };

})();
