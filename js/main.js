'use strict';

function repo_init(){
    core_repo_init({
      'events': {
        'assets-all': {
          'onchange': function(){
              const assets = globalThis.sources['assets'];
              for(const asset in assets){
                  document.getElementById('asset-' + asset + '-apply').checked = this.checked;
              }

              calculate();
          },
        },
        'savings-all': {
          'onchange': function(){
              const savings = globalThis.sources['savings'];
              for(const saving in savings){
                  document.getElementById('savings-' + saving + '-apply').checked = this.checked;
              }

              calculate();
          },
        },
        'goal-time': {
          'oninput': calculate_goal_time,
        },
      },
      'globals': {
        'intervals': {
          'hour': 8760,
          'work': 2080,
          'day': 365,
          'week': 52,
          'month': 12,
          'quarter': 4,
          'half': 2,
          'year': 1,
          'custom': 0.5,
        },
        'row_count': 0,
        'sources': {
          'assets': {},
          'savings': {},
        },
      },
      'storage': {
        'goal-time': 1,
        'sources': '{"assets":{"example asset":{"shares":100,"price":25,"gain":1,"interval":12}},"savings":{"example savings":{"amount":5000,"gain":0.23,"interval":12}}}',
      },
      'storage-menu': '<textarea id=sources></textarea><br>',
      'title': 'Finances.htm',
    });

    let intervalsbody = '';
    for(const interval in intervals){
        intervalsbody += '<tr>'
          + '<td>' + interval
          + '<td>' + (interval === 'custom'
            ? '<input class=mini id=total-custom-intervals step=any type=number value=0.5>'
            : intervals[interval])
          + '<td id=total-' + interval + '>'
          + '<td id=total-' + interval + '-percent>'
          + '<td id=total-' + interval + '-increase-' + interval + '>'
          + '<td id=total-' + interval + '-increase-yearly>';
    }
    document.getElementById('intervals-body').innerHTML = intervalsbody;
    document.getElementById('total-custom-intervals').oninput = function(){
        let customintervals = this.value;
        if(isNaN(customintervals)
          || customintervals < 0){
            customintervals = 0;
        }
        intervals['custom'] = customintervals;
        calculate();
    };

    const assets = JSON.parse(core_storage_data['sources'])['assets'];
    for(const asset in assets){
        new_asset(
          asset,
          assets[asset]['shares'],
          assets[asset]['price'],
          assets[asset]['gain'],
          assets[asset]['interval']
        );
    }
    const savings = JSON.parse(core_storage_data['sources'])['savings'];
    for(const saving in savings){
        new_savings(
          saving,
          savings[saving]['amount'],
          savings[saving]['gain'],
          savings[saving]['interval']
        );
    }

    calculate();
}
