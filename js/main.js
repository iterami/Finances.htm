'use strict';

function repo_init(){
    core_repo_init({
      'events': {
        'add-row': {
          'onclick': function(){
              new_row(
                void 0,
                0,
                0,
                0,
                1
              );
          },
        },
        'goal-gain': {
          'oninput': calculate_goal_gain,
        },
        'goal-seconds': {
          'oninput': calculate_goal_seconds,
        },
      },
      'globals': {
        'intervals': {
          'hour': 8760,
          'day': 365,
          'month': 12,
          'quarter': 4,
          'half': 2,
          'year': 1,
          'custom': 0.5,
        },
        'row_count': 0,
        'sources': {},
      },
      'storage': {
        'goal-gain': 1,
        'goal-seconds': 1,
        'sources': '{"example":{"amount":5000,"insured":0,"interest":0.23,"interval":12}}',
      },
      'storage-menu': '<textarea id=sources></textarea><br>',
      'title': 'Finances.htm',
    });

    let intervalsbody = '';
    for(const interval in intervals){
        intervalsbody += '<tr>'
          + '<td>' + interval
          + '<td>' + (interval === 'custom'
            ? '<input class=mini id=total-custom-intervals value=0.5>'
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

    const sources = JSON.parse(core_storage_data['sources']);
    for(const source in sources){
        new_row(
          source,
          sources[source]['amount'],
          sources[source]['insured'],
          sources[source]['interest'],
          sources[source]['interval']
        );
    }
}
