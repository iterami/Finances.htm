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
              1
            );
          },
        },
        'goal': {
          'oninput': calculate_goal,
        },
      },
      'globals': {
        'row_count': 0,
        'sources': {},
      },
      'storage': {
        'sources': '{"test":{"amount":500,"interest":1,"interval":12}}',
      },
      'storage-menu': '<textarea id=sources></textarea><br>',
      'title': 'Finances.htm',
    });

    const sources = JSON.parse(core_storage_data['sources']);
    for(const source in sources){
        new_row(
          source,
          sources[source]['amount'],
          sources[source]['interest'],
          sources[source]['interval']
        );
    }
}
