'use strict';

function calculate(){
    core_storage_data['sources'] = JSON.stringify(globalThis.sources);
    core_storage_update();

    let total = 0;
    let total_increase = 0;

    const sources = JSON.parse(core_storage_data['sources']);
    for(const source in sources){
        if(!document.getElementById(source + '-apply').checked){
            continue;
        }

        const amount = Number(document.getElementById(source + '-amount').value);
        const interest = Number(document.getElementById(source + '-interest').value);

        const gain = amount * (interest / 100) * (12 / sources[source]['interval']);
        const gain_increase = ((amount + gain) * (interest / 100) * (12 / sources[source]['interval'])) - gain;

        document.getElementById(source + '-gain').textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': gain,
        });
        document.getElementById(source + '-gain-increase').textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': gain_increase,
        });

        total += gain;
        total_increase += gain_increase;
    }

    const intervals_per_year = {
      'monthly': 12,
      'quarterly': 4,
      'yearly': 1,
    };
    for(const interval in intervals_per_year){
        document.getElementById('total-' + interval).textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': total / intervals_per_year[interval],
        });
        document.getElementById('total-' + interval + '-increase').textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': total_increase / intervals_per_year[interval],
        });
    }

    calculate_goal();
}

function calculate_goal(){
    const goal = Number(document.getElementById('goal').value);
    const total_yearly_gain = Number(document.getElementById('total-yearly').textContent);
    const total_yearly_increase = Number(document.getElementById('total-yearly-increase').textContent);

    document.getElementById('goal-years').textContent =
      Math.log(goal / total_yearly_gain) / Math.log(1 + total_yearly_increase / total_yearly_gain);
}

function new_row(id, amount, interest, interval){
    const row_id = id !== void 0
      ? id
      : row_count;

    document.getElementById('sources-body').innerHTML += '<tr>'
      + '<td><input id="' + row_id + '-remove" type=button value=->'
        + '<input id="' + row_id + '-apply" type=checkbox checked>'
      + '<td><input id="' + row_id + '" value="' + row_id + '">'
      + '<td><input id="' + row_id + '-amount" value="' + amount + '">'
      + '<td><input id="' + row_id + '-interest" value="' + interest + '">%'
      + '<td><select id="' + row_id + '-interval">'
        + '<option value=1>Monthly</option>'
        + '<option value=3>Quarterly</option>'
        + '<option value=12>Yearly</option>'
      + '</select>'
      + '<td id="' + row_id + '-gain">'
      + '<td id="' + row_id + '-gain-increase">';

    document.getElementById(row_id + '-interval').value = interval;

    sources[row_id] = {
      'amount': amount,
      'interest': interest,
      'interval': interval,
    };

    row_count++;
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
        document.getElementById(id + '-apply').onclick = update_values;
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

        document.getElementById(id + '-interval').value = sources[id]['interval'];
    }

    calculate();
}

function update_ids(old_id, new_id){
    const elements = [
      '',
      '-amount',
      '-apply',
      '-gain',
      '-gain-increase',
      '-interest',
      '-interval',
      '-remove',
    ];
    for(const i in elements){
        document.getElementById(old_id + elements[i]).id = new_id + elements[i];
    }

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
