'use strict';

function calculate(){
    core_storage_data['sources'] = JSON.stringify(globalThis.sources);
    core_storage_update();

    let assets = 0;
    let cash = 0;
    let savings = 0;
    let shares = 0;
    let total = 0;
    let total_gain = 0;
    let total_increase = 0;
    const source_totals = {
      'assets': {},
      'savings': {},
    };

    const sources = globalThis.sources;
    for(const asset in sources['assets']){
        const asset_shares = sources['assets'][asset]['shares'];
        const amount = asset_shares * sources['assets'][asset]['price'];
        const interval_gain = asset_shares * sources['assets'][asset]['gain'];

        let gain = 0;
        let gain_increase = 0;
        gain = interval_gain * sources['assets'][asset]['interval'];

        if(document.getElementById('asset-' + asset + '-apply').checked){
            assets += 1;
            shares += asset_shares;
            total += amount;
            total_gain += gain;
            total_increase += gain_increase;
        }

        source_totals['asset-' + asset] = {
          'amount': amount,
          'dividend': interval_gain,
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
            cash += amount;
            savings += 1;
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
        document.getElementById('asset-' + asset + '-dividend').innerHTML = format_number(source_totals['asset-' + asset]['dividend']);
        document.getElementById('asset-' + asset + '-total').innerHTML = format_number(source_totals['asset-' + asset]['gain']);
        document.getElementById('asset-' + asset + '-gain-percent').innerHTML = format_number(source_totals['asset-' + asset]['gain'] / source_totals['asset-' + asset]['amount'] * 100);
        document.getElementById('asset-' + asset + '-year-gain-percent').innerHTML = format_number(source_totals['asset-' + asset]['gain'] / total_gain * 100);
    }

    core_elements['assets'].innerHTML = format_number(
      assets,
      0
    );
    core_elements['cash'].innerHTML = format_number(
      cash,
      2
    );
    core_elements['cash-percent'].innerHTML = format_number((cash / total) * 100);
    core_elements['savings'].innerHTML = format_number(
      savings,
      0
    );
    core_elements['shares'].innerHTML = format_number(
      shares,
      0
    );
    core_elements['total'].innerHTML = format_number(
      total,
      2
    );
    core_elements['value'].innerHTML = format_number(
      total - cash,
      2
    );
    core_elements['value-percent'].innerHTML = format_number(((total - cash) / total) * 100);

    for(const asset in sources['assets']){
        document.getElementById('asset-' + asset + '-percent').innerHTML = format_number(source_totals['asset-' + asset]['amount'] / total * 100);
    }
    for(const saving in sources['savings']){
        document.getElementById('savings-' + saving + '-percent').innerHTML = format_number(source_totals['savings-' + saving]['amount'] / total * 100);
    }

    for(const interval in intervals){
        const increase = total_gain / intervals[interval];
        const increase_year = total_increase / intervals[interval];

        core_elements['total-' + interval].innerHTML = format_number(increase);
        core_elements['total-' + interval + '-percent'].innerHTML = total === 0
          ? ''
          : format_number((increase / total) * 100);
        core_elements['total-' + interval + '-increase-' + interval].innerHTML = format_number(increase_year / intervals[interval]);
        core_elements['total-' + interval + '-increase-yearly'].innerHTML = format_number(increase_year);
    }

    calculate_info();
}

function calculate_info(){
    core_storage_save([
      'goal-time',
      'tax',
    ]);

    const gain_per_second = Number(core_replace_multiple({
      'patterns': {
        ',': '',
      },
      'string': core_elements['total-hour'].textContent,
    })) / 3600;
    core_elements['goal-time-gain'].innerHTML = gain_per_second <= 0
      ? ''
      : time_format({
          'date': timestamp_to_date(core_storage_data['goal-time'] / gain_per_second * 1000),
          'diff': true,
          'milliseconds': true,
        });

    const gain_per_year = Number(core_replace_multiple({
      'patterns': {
        ',': '',
      },
      'string': core_elements['total-year'].textContent,
    }));
    core_elements['tax-result'].innerHTML = gain_per_year * (core_elements['tax'].value / 100);
}

function format_number(number, pad){
    if(!Number.isFinite(number)){
        return '';
    }

    pad = pad === void 0
      ? 7
      : pad;
    let result = core_number_format({
      'decimals-max': pad,
      'decimals-min': 0,
      'number': number,
    });
    if(pad === 0){
        return result;
    }

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
      + '<td>' + format_number(shares, 0)
      + '<td>' + format_number(price, 2)
      + '<td id="asset-' + id + '-amount">'
      + '<td id="asset-' + id + '-percent">'
      + '<td>' + format_number(gain)
      + '<td class=center>' + interval
      + '<td id="asset-' + id + '-dividend">'
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
          'oninput': calculate_info,
        },
        'tax': {
          'oninput': calculate_info,
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
        'sources': {
          'assets': {},
          'savings': {},
        },
      },
      'storage': {
        'goal-time': 1,
        'sources': '{"assets":{"example asset":{"shares":100,"price":25,"gain":1,"interval":12}},"savings":{"example savings":{"amount":5000,"gain":0.23,"interval":12}}}',
        'tax': 15,
      },
      'storage-menu': '<textarea id=sources></textarea><br>',
      'title': 'Finances.htm',
      'ui-elements': [
        'assets',
        'cash',
        'cash-percent',
        'goal-time-gain',
        'savings',
        'shares',
        'tax',
        'tax-result',
        'total',
        'value',
        'value-percent',
      ],
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
        if(globalThis.isNaN(customintervals)
          || customintervals < 0){
            customintervals = 0;
        }
        intervals['custom'] = customintervals;
        calculate();
    };
    for(const interval in intervals){
        core_elements['total-' + interval] = document.getElementById('total-' + interval);
        core_elements['total-' + interval + '-percent'] = document.getElementById('total-' + interval + '-percent');
        core_elements['total-' + interval + '-increase-' + interval] = document.getElementById('total-' + interval + '-increase-' + interval);
        core_elements['total-' + interval + '-increase-yearly'] = document.getElementById('total-' + interval + '-increase-yearly');
    }

    const json = JSON.parse(core_storage_data['sources']);

    let rows = '';
    const assets = json['assets'];
    for(const asset in assets){
        rows += new_asset(
          asset,
          assets[asset]['shares'],
          assets[asset]['price'],
          assets[asset]['gain'],
          assets[asset]['interval']
        );
    }
    document.getElementById('assets-body').innerHTML = rows;

    rows = '';
    const savings = json['savings'];
    for(const saving in savings){
        rows += new_savings(
          saving,
          savings[saving]['amount'],
          savings[saving]['gain'],
          savings[saving]['interval']
        );
    }
    document.getElementById('savings-body').innerHTML = rows;

    calculate();
}
