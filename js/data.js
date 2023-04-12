'use strict';

function calculate(){
    core_storage_data['sources'] = JSON.stringify(globalThis.sources);
    core_storage_update();

    let assets = 0;
    let total = 0;
    let total_gain = 0;
    let total_increase = 0;
    const source_totals = {
      'assets': {},
      'savings': {},
    };

    const sources = globalThis.sources;
    for(const asset in sources['assets']){
        const amount = sources['assets'][asset]['shares'] * sources['assets'][asset]['price'];
        const interval_gain = sources['assets'][asset]['shares'] * sources['assets'][asset]['gain'];

        let gain = 0;
        let gain_increase = 0;
        gain = interval_gain * sources['assets'][asset]['interval'];

        if(document.getElementById('asset-' + asset + '-apply').checked){
            assets += 1;
            total += amount;
            total_gain += gain;
            total_increase += gain_increase;
        }

        source_totals['asset-' + asset] = {
          'amount': amount,
          'gain': gain,
          'gain-increase': gain_increase,
        };
    }

    for(const saving in sources['savings']){
        const amount = sources['savings'][saving]['amount'];
        const interval_gain = sources['savings'][saving]['gain'];

        let gain = 0;
        let gain_increase = 0;
        const interest_percent_year = (interval_gain / 100) * sources['savings'][saving]['interval'];
        gain = amount * interest_percent_year;
        gain_increase = (amount + gain) * interest_percent_year - gain;

        if(document.getElementById('savings-' + saving + '-apply').checked){
            assets += 1;
            total += amount;
            total_gain += gain;
            total_increase += gain_increase;
        }

        source_totals['savings-' + saving] = {
          'amount': amount,
          'gain': gain,
          'gain-increase': gain_increase,
        };
    }

    for(const saving in sources['savings']){
        document.getElementById('savings-' + saving + '-total').innerHTML = format_number(source_totals['savings-' + saving]['gain']);
        document.getElementById('savings-' + saving + '-total-increase').innerHTML = format_number(source_totals['savings-' + saving]['gain-increase']);
        document.getElementById('savings-' + saving + '-year-gain-percent').innerHTML = format_number(source_totals['savings-' + saving]['gain'] / total_gain * 100);
    }
    for(const asset in sources['assets']){
        document.getElementById('asset-' + asset + '-amount').innerHTML = format_number(
          source_totals['asset-' + asset]['amount'],
          2
        );
        document.getElementById('asset-' + asset + '-total').innerHTML = format_number(source_totals['asset-' + asset]['gain']);
        document.getElementById('asset-' + asset + '-gain-percent').innerHTML = format_number(source_totals['asset-' + asset]['gain'] / source_totals['asset-' + asset]['amount'] * 100);
        document.getElementById('asset-' + asset + '-year-gain-percent').innerHTML = format_number(source_totals['asset-' + asset]['gain'] / total_gain * 100);
    }

    document.getElementById('assets').innerHTML = format_number(assets);
    document.getElementById('total').innerHTML = format_number(total);

    for(const asset in sources['assets']){
        document.getElementById('asset-' + asset + '-percent').innerHTML = format_number(source_totals['asset-' + asset]['amount'] / total * 100);
    }
    for(const saving in sources['savings']){
        document.getElementById('savings-' + saving + '-percent').innerHTML = format_number(source_totals['savings-' + saving]['amount'] / total * 100);
    }

    for(const interval in intervals){
        const increase = total_gain / intervals[interval];
        const increase_year = total_increase / intervals[interval];

        document.getElementById('total-' + interval).innerHTML = format_number(increase);
        document.getElementById('total-' + interval + '-percent').innerHTML = total === 0
          ? ''
          : format_number((increase / total) * 100);
        document.getElementById('total-' + interval + '-increase-' + interval).innerHTML = format_number(increase_year / intervals[interval]);
        document.getElementById('total-' + interval + '-increase-yearly').innerHTML = format_number(increase_year);
    }

    calculate_goal_time();
}

function calculate_goal_time(){
    core_storage_save({
      'keys': [
        'goal-time',
      ],
    });

    const gain_per_second = Number(document.getElementById('total-day').textContent) / 86400;
    document.getElementById('goal-time-gain').innerHTML = gain_per_second <= 0
      ? ''
      : time_format({
          'date': timestamp_to_date({
            'timestamp': core_storage_data['goal-time'] / gain_per_second * 1000,
          }),
          'diff': true,
          'milliseconds': true,
        });
}

function format_number(number, pad){
    if(!Number.isFinite(number)){
        return '';
    }

    pad = pad === void 0
      ? core_storage_data['decimals']
      : pad;
    let result = core_number_format({
      'decimals-max': pad,
      'decimals-min': 0,
      'number': number,
    });

    if(pad > -1){
        const decimal = result.indexOf('.');
        let decimal_length = decimal === -1
          ? -1
          : result.length - decimal - 1;
        if(decimal_length === 1){
            result += '0';
            decimal_length++;
        }

        while(decimal_length < pad){
            result += '&nbsp;';
            decimal_length++;
        }
    }

    return result;
}

function new_asset(id, shares, price, gain, interval){
    sources['assets'][id] = {
      'shares': shares,
      'price': price,
      'gain': gain,
      'interval': interval,
    };

    return '<tr>'
      + '<td><input id="asset-' + id + '-apply" onclick="calculate()" type=checkbox checked>'
      + '<td>' + id
      + '<td>' + shares
      + '<td>' + format_number(price, 2)
      + '<td id="asset-' + id + '-amount">'
      + '<td id="asset-' + id + '-percent">'
      + '<td>' + format_number(gain)
      + '<td class=center>' + interval
      + '<td id="asset-' + id + '-total">'
      + '<td id="asset-' + id + '-gain-percent">'
      + '<td id="asset-' + id + '-year-gain-percent">';
}

function new_savings(id, amount, gain, interval){
    sources['savings'][id] = {
      'amount': amount,
      'gain': gain,
      'interval': interval,
    };

    return '<tr>'
      + '<td><input id="savings-' + id + '-apply" onclick="calculate()" type=checkbox checked>'
      + '<td>' + id
      + '<td>' + format_number(amount, 2)
      + '<td id="savings-' + id + '-percent">'
      + '<td>' + gain
      + '<td id="savings-' + id + '-total">'
      + '<td id="savings-' + id + '-total-increase">'
      + '<td id="savings-' + id + '-year-gain-percent">';
}
