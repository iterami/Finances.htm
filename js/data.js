'use strict';

function calculate(){
    core_storage_data['sources'] = JSON.stringify(globalThis.sources);
    core_storage_update();

    let total = 0;
    let total_gain = 0;
    let total_increase = 0;
    let total_insured = 0;
    let total_uninsured = 0;

    const sources = JSON.parse(core_storage_data['sources']);
    for(const source in sources){
        const amount = Number(document.getElementById(source + '-amount').value);
        const insured = Number(document.getElementById(source + '-insured').value);
        const interest = Number(document.getElementById(source + '-interest').value);
        const interest_percent_year = (interest / 100) * sources[source]['interval'];

        const gain = amount * interest_percent_year;
        const gain_increase = (amount + gain) * interest_percent_year - gain;

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

        if(document.getElementById(source + '-apply').checked){
            total += amount;
            total_gain += gain;
            total_increase += gain_increase;
            total_insured += Math.min(
              amount,
              insured
            );
            if(amount > insured){
                total_uninsured += amount - insured;
            }
        }
    }

    const elements = {
      'total': total,
      'total-insured': total_insured,
      'total-uninsured': total_uninsured,
    };
    for(const element in elements){
        document.getElementById(element).textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': elements[element],
        });
        document.getElementById(element + '-percent').textContent = total <= 0
          ? ''
          : core_number_format({
              'decimals-max': 7,
              'decimals-min': 0,
              'number': (elements[element] / total) * 100,
            }) + '%';
    }

    for(const interval in intervals){
        const increase = total_gain / intervals[interval];
        const increase_year = total_increase / intervals[interval];

        document.getElementById('total-' + interval).textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': increase,
        });
        document.getElementById('total-' + interval + '-increase-' + interval).textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': increase_year / intervals[interval],
        });
        document.getElementById('total-' + interval + '-increase-year').textContent = core_number_format({
          'decimals-max': 7,
          'decimals-min': 2,
          'number': increase_year,
        });
        document.getElementById('total-' + interval + '-percent').textContent = total === 0
          ? ''
          : core_number_format({
              'decimals-max': 7,
              'decimals-min': 2,
              'number': (increase / total) * 100,
            }) + '%';
    }

    calculate_goal_gain();
    calculate_goal_seconds();
}

function calculate_goal_gain(){
    const goal_gain_text = document.getElementById('goal-gain').value;
    let goal_gain = Number(goal_gain_text);

    if(goal_gain_text.length === 0){
        goal_gain = Math.pow(
          10,
          String(Math.floor(Number(document.getElementById('total-year').textContent))).length
        );
        document.getElementById('goal-gain').value = goal_gain;
    }

    const total_year_gain = Number(document.getElementById('total-year').textContent);
    const total_year_increase = Number(document.getElementById('total-year-increase-year').textContent);
    let years = Math.log(goal_gain / total_year_gain) / Math.log(1 + total_year_increase / total_year_gain);
    if(isNaN(years)){
        years = Infinity;
    }

    document.getElementById('goal-gain-years').textContent = years > 0
      ? core_number_format({
        'decimals-max': 7,
        'decimals-min': 2,
        'number': years,
      })
      : 'Done!';

    core_storage_save();
}

function calculate_goal_seconds(){
    const goal_seconds_text = document.getElementById('goal-seconds').value;
    let goal_seconds = Number(goal_seconds_text);

    if(goal_seconds_text.length === 0
      || goal_seconds <= 0){
        goal_seconds = 1;
        document.getElementById('goal-seconds').value = goal_seconds;
    }

    const gain_per_second = Number(document.getElementById('total-day').textContent) / 86400;

    document.getElementById('goal-seconds-seconds').textContent = core_number_format({
      'decimals-max': 7,
      'decimals-min': 0,
      'number': goal_seconds / gain_per_second,
    });

    core_storage_save();
}

function new_row(id, amount, insured, interest, interval){
    const row_id = id !== void 0
      ? id
      : row_count;
    let bodycontent = '<tr>'
      + '<td><input id="' + row_id + '-remove" type=button value=x><input id="' + row_id + '-apply" type=checkbox checked>'
      + '<td><input id="' + row_id + '" value="' + row_id + '">'
      + '<td><input id="' + row_id + '-amount" value="' + amount + '">'
      + '<td><input id="' + row_id + '-interest" value="' + interest + '">'
      + '<td><select id="' + row_id + '-interval">';
    for(const interval in intervals){
        bodycontent += '<option value=' + intervals[interval] + '>' + interval + '</option>';
    }
    bodycontent += '</select>'
      + '<td><input id="' + row_id + '-insured" value="' + insured + '">'
      + '<td id="' + row_id + '-gain">'
      + '<td id="' + row_id + '-gain-increase">';

    document.getElementById('sources-body').innerHTML += bodycontent;
    document.getElementById(row_id + '-interval').value = interval;

    sources[row_id] = {
      'amount': amount,
      'insured': insured,
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
            if(this.value.length === 0
              || this.value in sources){
                this.value = this.id;
                return;
            }

            update_ids(
              this.id,
              this.value
            );
        };
        document.getElementById(id + '-amount').oninput = update_values;
        document.getElementById(id + '-insured').oninput = update_values;
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
        sources[id]['amount'] = Number(document.getElementById(id + '-amount').value);
        sources[id]['insured'] = Number(document.getElementById(id + '-insured').value);
        sources[id]['interest'] = Number(document.getElementById(id + '-interest').value);
        sources[id]['interval'] = Number(document.getElementById(id + '-interval').value);
    }

    calculate();
}
