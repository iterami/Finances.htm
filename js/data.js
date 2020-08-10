'use strict';

function calculate(){
    core_storage_data['sources'] = JSON.stringify(globalThis.sources);
    core_storage_update();

    let total = 0;

    const sources = JSON.parse(core_storage_data['sources']);
    for(const source in sources){
        const amount = document.getElementById(source + '-amount').value;
        const interest = document.getElementById(source + '-interest').value;

        let gain = amount * (interest / 100);

        if(sources[source]['interval'] == 0){
            gain *= 12;
        }

        document.getElementById(source + '-gain').textContent = core_number_format({
          'decimals-max': 5,
          'decimals-min': 2,
          'number': gain,
        });

        total += gain;
    }

    document.getElementById('total-yearly').textContent = core_number_format({
      'decimals-max': 5,
      'decimals-min': 2,
      'number': total,
    });
    document.getElementById('total-monthly').textContent = core_number_format({
      'decimals-max': 5,
      'decimals-min': 2,
      'number': total / 12,
    });
}

function new_row(id, amount, interest, interval){
    const row_id = id !== void 0
      ? id
      : row_count;

    document.getElementById('sources-body').innerHTML += '<tr>'
      + '<td><input id="' + row_id + '-remove" type=button value=->'
      + '<td><input id="' + row_id + '" value="' + row_id + '">'
      + '<td><input id="' + row_id + '-amount" value="' + amount + '">'
      + '<td><input id="' + row_id + '-interest" value="' + interest + '">%'
        + '<select id="' + row_id + '-interval"><option value=0>Monthly</option><option value=1>Yearly</option></select>'
      + '<td id="' + row_id + '-gain">';

    document.getElementById(row_id + '-interval').selectedIndex = interval;

    sources[row_id] = {
      'amount': amount,
      'interest': interest,
      'interval': interval,
    };

    update_events();
}

function remove_row(row_id){
    row_id = row_id.substr(
      0,
      row_id.indexOf('-')
    );

    if(!globalThis.confirm('Remove row ' + row_id + '?')){
        return;
    }

    document.getElementById(row_id).parentNode.parentNode.remove();

    delete sources[row_id];

    update_events();
}

function update_events(){
    for(const id in sources){
        document.getElementById(id + '-remove').onclick = function(){
            remove_row(this.id);
        };
        document.getElementById(id).oninput = function(){
            update_ids(
              this.id,
              this.value
            );
        };
        document.getElementById(id + '-amount').oninput = update_values;
        document.getElementById(id + '-interest').oninput = update_values;
        document.getElementById(id + '-interval').onchange = update_values;
    }

    calculate();
}

function update_ids(old_id, new_id){
    document.getElementById(old_id + '-remove').id = new_id + '-remove';
    document.getElementById(old_id).id = new_id;
    document.getElementById(old_id + '-amount').id = new_id + '-amount';
    document.getElementById(old_id + '-interest').id = new_id + '-interest';
    document.getElementById(old_id + '-interval').id = new_id + '-interval';
    document.getElementById(old_id + '-gain').id = new_id + '-gain';

    sources[new_id] = sources[old_id];
    delete sources[old_id];

    update_events();
}

function update_values(){
    for(const id in sources){
        sources[id]['amount'] = document.getElementById(id + '-amount').value;
        sources[id]['interest'] = document.getElementById(id + '-interest').value;
        sources[id]['interval'] = document.getElementById(id + '-interval').value;
    }

    calculate();
}
